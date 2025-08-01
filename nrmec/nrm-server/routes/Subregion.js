const express = require("express");
const router = express.Router();
const {
  Subregion,
  District,
  Region,
  RegionalCoordinator,
  AuditTrail,
  PendingAction,
  ConstituencyMunicipality,
  SubcountyDivision,
  ParishWard,
  VillageCell,
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Get all subregions
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const subregions = await Subregion.findAll();
    res.json(subregions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific subregion
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const subregion = await Subregion.findByPk(req.params.id);
    if (subregion) {
      res.json(subregion);
    } else {
      res.status(404).json({ message: "Subregion not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new subregion
router.post(
  "/",
  authMiddleware,
  checkPermission("RegionalCoordinator"),
  async (req, res) => {
    try {
     
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "Subregion",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res
          .status(202)
          .json({
            message: "Subregion creation request submitted for approval",
            pendingActionId: pendingAction.id,
          });
      } else {
        const subregion = await Subregion.create({
          ...req.body,
          status: "pending", // Ensure this matches the column definition in your database
          createdBy: req.user.id,
        });

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "Subregion",
          entityId: subregion.id,
          newData: JSON.stringify(subregion),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "PENDING", // Ensure this matches the column definition in your database
        });

        res.status(201).json(subregion);
      }
    } catch (error) {
      console.error("Error creating subregion:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Update a subregion
router.put(
  "/:id",
  authMiddleware,
  checkPermission("RegionalCoordinator"),
  async (req, res) => {
    try {
      const subregion = await Subregion.findByPk(req.params.id);
      if (subregion) {
        if (subregion.status === "approved") {
          return res
            .status(403)
            .json({ message: "Cannot modify an approved subregion" });
        }
        const oldData = JSON.stringify(subregion);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "Subregion",
            entityId: req.params.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Subregion update request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await subregion.update({
            ...req.body,
            status: "pending",
            updatedBy: req.user.id,
          });

          // Create audit trail entry
          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "Subregion",
            entityId: subregion.id,
            oldData: oldData,
            newData: JSON.stringify(subregion),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "PENDING",
          });

          res.json(subregion);
        }
      } else {
        res.status(404).json({ message: "Subregion not found" });
      }
    } catch (error) {
      console.error("Error updating subregion:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Delete a subregion
router.delete(
  "/:id",
  authMiddleware,
  checkPermission("RegionalCoordinator"),
  async (req, res) => {
    try {
      const subregion = await Subregion.findByPk(req.params.id);
      if (subregion) {
        if (subregion.status === "approved") {
          return res
            .status(403)
            .json({ message: "Cannot delete an approved subregion" });
        }
        const deletedData = JSON.stringify(subregion);
        await subregion.destroy();

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "DELETE",
          entityType: "Subregion",
          entityId: subregion.id,
          oldData: deletedData,
          data: deletedData,
          actionBy: req.user.id,
          status: "PENDING",
        });

        res.json({ message: "Subregion deleted" });
      } else {
        res.status(404).json({ message: "Subregion not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a subregion (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const subregion = await Subregion.findByPk(req.params.id);
      if (subregion) {
        await subregion.update({ status: "approved", approvedBy: req.user.id });
        res.json(subregion);
      } else {
        res.status(404).json({ message: "Subregion not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all districts in a subregion
router.get(
  "/:subregionId/districts",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const districts = await District.findAll({
        where: { subregionId: req.params.subregionId },
      });
      res.json(districts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a district in a subregion
router.post(
  "/:subregionId/districts",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const district = await District.create({
        ...req.body,
        subregionId: req.params.subregionId,
      });
      res.status(201).json(district);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all regional coordinators in a subregion
router.get(
  "/:subregionId/regionalCoordinators",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const regionalCoordinators = await RegionalCoordinator.findAll({
        where: { subregionId: req.params.subregionId },
      });
      res.json(regionalCoordinators);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a regional coordinator in a subregion
router.post(
  "/:subregionId/regionalCoordinators",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const regionalCoordinator = await RegionalCoordinator.create({
        ...req.body,
        subregionId: req.params.subregionId,
      });

      // Create audit trail entry
      await AuditTrail.create({
        actionType: "CREATE",
        entityType: "RegionalCoordinator",
        entityId: regionalCoordinator.id,
        newData: JSON.stringify(regionalCoordinator),
        data: JSON.stringify(req.body),
        actionBy: req.user.id,
        status: "APPROVED",
      });

      res.status(201).json(regionalCoordinator);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a regional coordinator in a subregion
router.put(
  "/:subregionId/regionalCoordinators/:id",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const regionalCoordinator = await RegionalCoordinator.findByPk(
        req.params.id
      );
      if (regionalCoordinator) {
        const oldData = JSON.stringify(regionalCoordinator);
        await regionalCoordinator.update(req.body);

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "UPDATE",
          entityType: "RegionalCoordinator",
          entityId: regionalCoordinator.id,
          oldData: oldData,
          newData: JSON.stringify(regionalCoordinator),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.json(regionalCoordinator);
      } else {
        res.status(404).json({ message: "Regional Coordinator not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a regional coordinator in a subregion
router.delete(
  "/:subregionId/regionalCoordinators/:id",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const regionalCoordinator = await RegionalCoordinator.findByPk(
        req.params.id
      );
      if (regionalCoordinator) {
        const deletedData = JSON.stringify(regionalCoordinator);
        await regionalCoordinator.destroy();

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "DELETE",
          entityType: "RegionalCoordinator",
          entityId: regionalCoordinator.id,
          oldData: deletedData,
          data: deletedData,
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.json({ message: "Regional Coordinator deleted" });
      } else {
        res.status(404).json({ message: "Regional Coordinator not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a regional coordinator (SuperAdmin only)
router.put(
  "/:subregionId/regionalCoordinators/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const coordinator = await RegionalCoordinator.findOne({
        where: { id: req.params.id, subregionId: req.params.subregionId },
      });
      if (coordinator) {
        const oldData = JSON.stringify(coordinator);
        await coordinator.update({
          isApproved: true,
          approvedBy: req.user.id,
          approvedAt: new Date(),
        });

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "APPROVE",
          entityType: "RegionalCoordinator",
          entityId: coordinator.id,
          oldData: oldData,
          newData: JSON.stringify(coordinator),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.json(coordinator);
      } else {
        res.status(404).json({ message: "Regional Coordinator not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.post(
  "/:regionId/subregions",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const subregion = await Subregion.create({
        ...req.body,
        regionId: req.params.regionId,
      });

      // Create audit trail entry
      await AuditTrail.create({
        actionType: "CREATE",
        entityType: "Subregion",
        entityId: subregion.id,
        data: JSON.stringify(subregion),
        actionBy: req.user.id,
        status: "APPROVED",
      });

      res.status(201).json(subregion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Add this new route to get subregion details
router.get("/:subregionId/details", async (req, res) => {
  try {
    const { subregionId } = req.params;

    const subregion = await Subregion.findByPk(subregionId);
    if (!subregion) {
      return res.status(404).json({ message: "Subregion not found" });
    }
    
    // Get parent region information
    const parentRegion = await Region.findByPk(subregion.regionId);
   
    // Get all districts for this subregion
    const districts = await District.findAll({
      where: { subregionId }
    });
   
    // Calculate total counts and district-wise breakdown
    const districtBreakdown = await Promise.all(
      districts.map(async (district) => {
        // Get constituencies for this district
        const constituencies = await ConstituencyMunicipality.findAll({
          where: { districtId: district.id }
        });

        // Get subcounties for these constituencies (using correct field name)
        const subcounties = await SubcountyDivision.findAll({
          where: { constituencyDivisionId: constituencies.map(c => c.id) }
        });

        // Get parishes for these subcounties
        const parishes = await ParishWard.findAll({
          where: { subcountyDivisionId: subcounties.map(s => s.id) }
        });

        // Get villages for these parishes
        const villages = await VillageCell.findAll({
          where: { parishWardId: parishes.map(p => p.id) }
        });

        const breakdown = {
          id: district.id,
          name: district.name,
          constituenciesCount: constituencies.length,
          subcountiesCount: subcounties.length,
          parishesCount: parishes.length,
          villagesCount: villages.length,
        };
       
        return breakdown;
      })
    );

    const response = {
      id: subregion.id,
      name: subregion.name,
      districtsCount: districts.length,
      constituenciesCount: districtBreakdown.reduce((sum, d) => sum + d.constituenciesCount, 0),
      subcountiesCount: districtBreakdown.reduce((sum, d) => sum + d.subcountiesCount, 0),
      parishesCount: districtBreakdown.reduce((sum, d) => sum + d.parishesCount, 0),
      villagesCount: districtBreakdown.reduce((sum, d) => sum + d.villagesCount, 0),
      districtBreakdown,
      // Add hierarchy information
      hierarchy: {
        region: parentRegion ? {
          id: parentRegion.id,
          name: parentRegion.name
        } : null
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error in subregion details route:", error);
    res.status(500).json({ 
      message: "Error fetching subregion details",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
