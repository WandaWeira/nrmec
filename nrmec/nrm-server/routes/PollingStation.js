// routes/PollingStation.js
const express = require("express");
const router = express.Router();
const {
  PollingStation,
  ParishWard,
  SubcountyDivision,
  ConstituencyMunicipality,
  District,
  Subregion,
  Region,
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Get all polling stations with complete hierarchy
router.get("/", async (req, res) => {
  try {
    const pollingStations = await PollingStation.findAll({
      include: [
        {
          model: ParishWard,
          as: "parishWard",
          attributes: ["id", "name", "type", "subcountyDivisionId"],
        },
      ],
      attributes: ["id", "name", "code", "parishWardId"],
    });


    const formattedStations = pollingStations.map((station) => ({
      id: station.id,
      name: station.name,
      code: station.code,
      parishWardId: station.parishWardId,
      parishWardName: station.parishWard?.name || "",
      parishWardType: station.parishWard?.type || "",
    }));

    res.json(formattedStations);
  } catch (error) {
    console.error("Error fetching polling stations:", error);
    res.status(500).json({
      message: "Error fetching polling stations",
      error: error.message,
    });
  }
});

// Create a new polling station
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, code, parishWardId } = req.body;

    // Validate required fields
    if (!name || !code || !parishWardId) {
      return res.status(400).json({
        message: "Name, code, and parish/ward are required fields",
      });
    }

    // Check if code is unique
    const existingStation = await PollingStation.findOne({
      where: { code },
    });

    if (existingStation) {
      return res.status(400).json({
        message: "A polling station with this code already exists",
      });
    }

    // Check if parish/ward exists
    const parishWard = await ParishWard.findByPk(parishWardId);
    if (!parishWard) {
      return res.status(400).json({
        message: "Invalid parish/ward selected",
      });
    }

    const pollingStation = await PollingStation.create({
      name,
      code,
      parishWardId,
    });

    res.status(201).json(pollingStation);
  } catch (error) {
    console.error("Error creating polling station:", error);
    res.status(400).json({
      message: "Error creating polling station",
      error: error.message,
    });
  }
});

// Update a polling station
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, parishWardId } = req.body;

    // Validate required fields
    if (!name || !code || !parishWardId) {
      return res.status(400).json({
        message: "Name, code, and parish/ward are required fields",
      });
    }

    const pollingStation = await PollingStation.findByPk(id);
    if (!pollingStation) {
      return res.status(404).json({ message: "Polling station not found" });
    }

    // Check if code is unique (excluding current station)
    const existingStation = await PollingStation.findOne({
      where: { code, id: { [Op.ne]: id } },
    });

    if (existingStation) {
      return res.status(400).json({
        message: "A polling station with this code already exists",
      });
    }

    // Check if parish/ward exists
    const parishWard = await ParishWard.findByPk(parishWardId);
    if (!parishWard) {
      return res.status(400).json({
        message: "Invalid parish/ward selected",
      });
    }

    await pollingStation.update({ name, code, parishWardId });
    res.json(pollingStation);
  } catch (error) {
    console.error("Error updating polling station:", error);
    res.status(400).json({
      message: "Error updating polling station",
      error: error.message,
    });
  }
});

// Delete a polling station
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const pollingStation = await PollingStation.findByPk(id);
      if (!pollingStation) {
        return res.status(404).json({ message: "Polling station not found" });
      }

      await pollingStation.destroy();
      res.json({ message: "Polling station deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
