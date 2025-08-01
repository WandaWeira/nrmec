const express = require("express");
const router = express.Router();
const {
  VillageCell,
  ParishWard,
  SubcountyDivision,
  ConstituencyMunicipality,
  District,
  Subregion,
  Region,
  Population,
  Infrastructure,
  VillageCellRegistra,
  AuditTrail,
  PendingAction
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Get all districts
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const districts = await District.findAll();
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific district
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const district = await District.findByPk(req.params.id);
    if (district) {
      res.json(district);
    } else {
      res.status(404).json({ message: "District not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new district
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "District",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "District creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      } else {
        const district = await District.create({
          ...req.body,
          status: req.user.role === "SuperAdmin" ? "approved" : "pending",
          createdBy: req.user.id,
        });

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "District",
          entityId: district.id,
          newData: JSON.stringify(district),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: req.user.role === "SuperAdmin" ? "APPROVED" : "PENDING",
        });

        res.status(201).json(district);
      }
    } catch (error) {
      console.error("Error creating district:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Update a district
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      if (req.user.role === "SuperAdmin") {
        const district = await District.findByPk(req.params.id);
        if (district) {
          const oldData = JSON.stringify(district);
          await district.update({
            ...req.body,
            status: "approved",
            updatedBy: req.user.id,
          });

          // Create audit trail entry
          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "District",
            entityId: district.id,
            oldData: oldData,
            newData: JSON.stringify(district),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json(district);
        } else {
          res.status(404).json({ message: "District not found" });
        }
      } else {
        const pendingAction = await PendingAction.create({
          actionType: "UPDATE",
          entityType: "District",
          entityId: req.params.id,
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "District update request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a district
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const district = await District.findByPk(req.params.id);
      if (district) {
        if (req.user.role !== "SuperAdmin" && district.status === "approved") {
          return res
            .status(403)
            .json({ message: "Cannot delete an approved district" });
        }
        const deletedData = JSON.stringify(district);
        await district.destroy();

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "DELETE",
          entityType: "District",
          entityId: district.id,
          data: deletedData,
          actionBy: req.user.id,
          status: req.user.role === "SuperAdmin" ? "APPROVED" : "PENDING",
        });

        res.json({ message: "District deleted" });
      } else {
        res.status(404).json({ message: "District not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all districts that are cities
router.get(
  "/cities",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const cityDistricts = await District.findAll({
        where: { hasCity: true },
      });
      res.json(cityDistricts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a district (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const district = await District.findByPk(req.params.id);
      if (district) {
        await district.update({ status: "approved", approvedBy: req.user.id });
        res.json(district);
      } else {
        res.status(404).json({ message: "District not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all constituencies in a district
router.get(
  "/:districtId/constituencies",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const constituencies = await Constituency.findAll({
        where: { districtId: req.params.districtId },
      });
      res.json(constituencies);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a constituency in a district
router.post(
  "/:districtId/constituencies",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const constituency = await Constituency.create({
        ...req.body,
        districtId: req.params.districtId,
      });
      res.status(201).json(constituency);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all divisions in a district
router.get(
  "/:districtId/divisions",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const divisions = await Division.findAll({
        where: { districtId: req.params.districtId },
      });
      res.json(divisions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a division in a district
router.post(
  "/:districtId/divisions",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const division = await Division.create({
        ...req.body,
        districtId: req.params.districtId,
      });

      // Create audit trail entry
      await AuditTrail.create({
        actionType: "CREATE",
        entityType: "Division",
        entityId: division.id,
        newData: JSON.stringify(division),
        data: JSON.stringify(req.body),
        actionBy: req.user.id,
        status: "APPROVED",
      });

      res.status(201).json(division);
    } catch (error) {
      console.error("Error creating division:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Get all registrars for a district
router.get(
  "/:districtId/registrars",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const registrars = await DistrictRegistra.findAll({
        where: { districtId: req.params.districtId },
      });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new registrar for a district
router.post(
  "/:districtId/registrars",
  authMiddleware,
  checkPermission(["SuperAdmin", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const registrar = await DistrictRegistra.create({
        ...req.body,
        districtId: req.params.districtId,
        createdBy: req.user.id,
      });

      // Create audit trail entry
      await AuditTrail.create({
        actionType: "CREATE",
        entityType: "DistrictRegistra",
        entityId: registrar.id,
        newData: JSON.stringify(registrar),
        data: JSON.stringify(req.body),
        actionBy: req.user.id,
        status: "PENDING",
      });

      res.status(201).json(registrar);
    } catch (error) {
      console.error("Error creating district registrar:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Update a registrar
router.put(
  "/:districtId/registrars/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const registrar = await DistrictRegistra.findOne({
        where: { id: req.params.id, districtId: req.params.districtId },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        await registrar.update({
          ...req.body,
          updatedBy: req.user.id,
        });

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "UPDATE",
          entityType: "DistrictRegistra",
          entityId: registrar.id,
          oldData: oldData,
          newData: JSON.stringify(registrar),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "PENDING",
        });

        res.json(registrar);
      } else {
        res.status(404).json({ message: "Registrar not found" });
      }
    } catch (error) {
      console.error("Error updating district registrar:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Delete a registrar
router.delete(
  "/:districtId/registrars/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const registrar = await DistrictRegistra.findOne({
        where: { id: req.params.id, districtId: req.params.districtId },
      });
      if (registrar) {
        const deletedData = JSON.stringify(registrar);
        await registrar.destroy();

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "DELETE",
          entityType: "DistrictRegistra",
          entityId: registrar.id,
          oldData: deletedData,
          data: deletedData,
          actionBy: req.user.id,
          status: "PENDING",
        });

        res.json({ message: "Registrar deleted" });
      } else {
        res.status(404).json({ message: "Registrar not found" });
      }
    } catch (error) {
      console.error("Error deleting district registrar:", error);
      res.status(500).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Approve a district registrar (SuperAdmin only)
router.put(
  "/:districtId/registrars/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const registrar = await DistrictRegistra.findOne({
        where: { id: req.params.id, districtId: req.params.districtId },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        await registrar.update({
          isApproved: true,
          approvedBy: req.user.id,
          approvedAt: new Date(),
        });

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "APPROVE",
          entityType: "DistrictRegistra",
          entityId: registrar.id,
          oldData: oldData,
          newData: JSON.stringify(registrar),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.json(registrar);
      } else {
        res.status(404).json({ message: "Registrar not found" });
      }
    } catch (error) {
      console.error("Error approving district registrar:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Add this new route to get district details
router.get("/:districtId/details", async (req, res) => {
  try {
    const { districtId } = req.params;

    const district = await District.findByPk(districtId);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    // Get parent hierarchy information
    const parentSubregion = await Subregion.findByPk(district.subregionId);
    let parentRegion = null;
    if (parentSubregion) {
      parentRegion = await Region.findByPk(parentSubregion.regionId);
    }

    // Get constituencies for this district
    const constituencies = await ConstituencyMunicipality.findAll({
      where: { districtId: districtId },
    });

    // Calculate total counts and constituency-wise breakdown
    const constituencyBreakdown = await Promise.all(
      constituencies.map(async (constituency) => {
        try {
          // Get subcounties for this constituency - using the correct field name
          const subcounties = await SubcountyDivision.findAll({
            where: { constituencyDivisionId: constituency.id },
          });

          if (subcounties.length === 0) {
            const rawSubcounties = await SubcountyDivision.findAll({
              raw: true,
              logging: console.log, // This will log the SQL query
            });
          }

          // Get parishes for these subcounties
          const parishes = await ParishWard.findAll({
            where: { subcountyDivisionId: subcounties.map((s) => s.id) },
          });

          // Get villages for these parishes
          const villages = await VillageCell.findAll({
            where: { parishWardId: parishes.map((p) => p.id) },
          });

          return {
            id: constituency.id,
            name: constituency.name,
            type: constituency.type,
            subcountiesCount: subcounties.length,
            parishesCount: parishes.length,
            villagesCount: villages.length,
          };
        } catch (error) {
          console.error(
            `Error processing constituency ${constituency.name}:`,
            error
          );
          console.error("Error stack:", error.stack);
          return {
            id: constituency.id,
            name: constituency.name,
            type: constituency.type,
            subcountiesCount: 0,
            parishesCount: 0,
            villagesCount: 0,
          };
        }
      })
    );

    const response = {
      id: district.id,
      name: district.name,
      constituenciesCount: constituencies.length,
      subcountiesCount: constituencyBreakdown.reduce(
        (sum, c) => sum + c.subcountiesCount,
        0
      ),
      parishesCount: constituencyBreakdown.reduce(
        (sum, c) => sum + c.parishesCount,
        0
      ),
      villagesCount: constituencyBreakdown.reduce(
        (sum, c) => sum + c.villagesCount,
        0
      ),
      constituencyBreakdown,
      // Add hierarchy information
      hierarchy: {
        subregion: parentSubregion ? {
          id: parentSubregion.id,
          name: parentSubregion.name
        } : null,
        region: parentRegion ? {
          id: parentRegion.id,
          name: parentRegion.name
        } : null
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error in district details route:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error fetching district details",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Changes 20/09/2024      - END  --------------------------------------------
module.exports = router;
