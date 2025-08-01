const express = require("express");
const router = express.Router();
const {
  Region,
  PendingAction,
  AuditTrail,
  Subregion,
  District,
  ConstituencyMunicipality,
  SubcountyDivision,
  ParishWard,
  VillageCell,
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Get all regions
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const regions = await Region.findAll();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific region
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const region = await Region.findByPk(req.params.id);
    if (region) {
      res.json(region);
    } else {
      res.status(404).json({ message: "Region not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new region
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      if (req.user.role === "SuperAdmin") {
        const newRegion = await Region.create(req.body);
        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "Region",
          entityId: newRegion.id,
          data: JSON.stringify(newRegion),
          actionBy: req.user.id,
          status: "APPROVED",
        });
        res.status(201).json(newRegion);
      } else {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "Region",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "Region creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      }
    } catch (error) {
      console.error("Error creating region:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update a region
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const region = await Region.findByPk(req.params.id);
      if (region) {
        if (req.user.role === "SuperAdmin") {
          const oldData = JSON.stringify(region);
          await region.update(req.body);
          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "Region",
            entityId: region.id,
            oldData: oldData,
            newData: JSON.stringify(region),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });
          res.json(region);
        } else {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "Region",
            entityId: region.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Region update request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        }
      } else {
        res.status(404).json({ message: "Region not found" });
      }
    } catch (error) {
      console.error("Error updating region:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Delete a region
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const region = await Region.findByPk(req.params.id);
      if (region) {
        if (req.user.role === "SuperAdmin") {
          const deletedData = JSON.stringify(region);
          await region.destroy();
          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "Region",
            entityId: region.id,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });
          res.json({ message: "Region deleted" });
        } else {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "Region",
            entityId: region.id,
            data: JSON.stringify(region),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Region deletion request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        }
      } else {
        res.status(404).json({ message: "Region not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a pending action (SuperAdmin only)
router.put(
  "/approve/:pendingActionId",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pendingAction = await PendingAction.findByPk(
        req.params.pendingActionId
      );
      if (!pendingAction) {
        return res.status(404).json({ message: "Pending action not found" });
      }

      const data = JSON.parse(pendingAction.data);

      switch (pendingAction.actionType) {
        case "CREATE":
          const newRegion = await Region.create(data);
          await AuditTrail.create({
            actionType: "CREATE",
            entityType: "Region",
            entityId: newRegion.id,
            data: JSON.stringify(newRegion),
            actionBy: req.user.id,
            status: "APPROVED",
          });
          break;
        case "UPDATE":
          const regionToUpdate = await Region.findByPk(pendingAction.entityId);
          if (regionToUpdate) {
            const oldData = JSON.stringify(regionToUpdate);
            await regionToUpdate.update(data);
            await AuditTrail.create({
              actionType: "UPDATE",
              entityType: "Region",
              entityId: regionToUpdate.id,
              oldData: oldData,
              newData: JSON.stringify(regionToUpdate),
              data: JSON.stringify(data),
              actionBy: req.user.id,
              status: "APPROVED",
            });
          }
          break;
        case "DELETE":
          const regionToDelete = await Region.findByPk(pendingAction.entityId);
          if (regionToDelete) {
            const deletedData = JSON.stringify(regionToDelete);
            await regionToDelete.destroy();
            await AuditTrail.create({
              actionType: "DELETE",
              entityType: "Region",
              entityId: regionToDelete.id,
              data: deletedData,
              actionBy: req.user.id,
              status: "APPROVED",
            });
          }
          break;
      }

      await pendingAction.update({
        status: "APPROVED",
        approvedBy: req.user.id,
      });
      res.json({ message: "Action approved and executed successfully" });
    } catch (error) {
      console.error("Error approving action:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Modify the /:regionId/details route
router.get("/:regionId/details", async (req, res) => {
  try {
    const { regionId } = req.params;
   
    const region = await Region.findByPk(regionId);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }

    // Get all subregions for this region
    const subregions = await Subregion.findAll({
      where: { regionId },
    });

    // Calculate total counts and subregion-wise breakdown
    const subregionBreakdown = await Promise.all(
      subregions.map(async (subregion) => {
        // Get districts for this subregion
        const districts = await District.findAll({
          where: { subregionId: subregion.id },
        });

        // Get constituencies for these districts
        const constituencies = await ConstituencyMunicipality.findAll({
          where: { districtId: districts.map((d) => d.id) },
        });

        // Get subcounties for these constituencies
        const subcounties = await SubcountyDivision.findAll({
          where: { constituencyDivisionId: constituencies.map((c) => c.id) },
        });

        // Get parishes for these subcounties
        const parishes = await ParishWard.findAll({
          where: { subcountyDivisionId: subcounties.map((s) => s.id) },
        });

        // Get villages for these parishes
        const villages = await VillageCell.findAll({
          where: { parishWardId: parishes.map((p) => p.id) },
        });

        return {
          id: subregion.id,
          name: subregion.name,
          districtsCount: districts.length,
          constituenciesCount: constituencies.length,
          subcountiesCount: subcounties.length,
          parishesCount: parishes.length,
          villagesCount: villages.length,
        };
      })
    );

    const response = {
      name: region.name,
      subregionsCount: subregions.length,
      districtsCount: subregionBreakdown.reduce(
        (sum, s) => sum + s.districtsCount,
        0
      ),
      constituenciesCount: subregionBreakdown.reduce(
        (sum, s) => sum + s.constituenciesCount,
        0
      ),
      subcountiesCount: subregionBreakdown.reduce(
        (sum, s) => sum + s.subcountiesCount,
        0
      ),
      parishesCount: subregionBreakdown.reduce(
        (sum, s) => sum + s.parishesCount,
        0
      ),
      villagesCount: subregionBreakdown.reduce(
        (sum, s) => sum + s.villagesCount,
        0
      ),
      subregionBreakdown,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in region details route:", error);
    res.status(500).json({
      message: "Error fetching region details",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Get summary of all regions
router.get("/summary", async (req, res) => {
  try {
    // First, just get all regions
    const regions = await Region.findAll({
      attributes: ['id', 'name']
    });

    if (!regions || regions.length === 0) {
      return res.status(404).json({ message: "No regions found" });
    }

    res.json(regions);
    
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ message: "Error fetching regions", error: error.message });
  }
});

module.exports = router;
