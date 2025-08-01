const express = require("express");
const router = express.Router();
const { OppositionCandidate } = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Get all opposition candidates
router.get("/", authMiddleware, async (req, res) => {
  try {
    const candidates = await OppositionCandidate.findAll();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create opposition candidate
router.post("/", authMiddleware, checkPermission(["SuperAdmin", "PEO"]), async (req, res) => {
    
  try {
    const candidate = await OppositionCandidate.create(req.body);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update opposition candidate
router.put("/:id", authMiddleware, checkPermission(["SuperAdmin", "PEO"]), async (req, res) => {
  try {
    const [updated] = await OppositionCandidate.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedCandidate = await OppositionCandidate.findByPk(req.params.id);
      res.status(200).json(updatedCandidate);
    } else {
      res.status(404).json({ message: "Candidate not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete opposition candidate
router.delete("/:id", authMiddleware, checkPermission(["SuperAdmin", "PEO"]), async (req, res) => {
  try {
    const deleted = await OppositionCandidate.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Candidate not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;