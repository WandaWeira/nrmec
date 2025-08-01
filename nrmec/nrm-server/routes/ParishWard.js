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

// Get all parish wards
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const parishWards = await ParishWard.findAll();
    res.json(parishWards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific parish ward
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const parishWard = await ParishWard.findByPk(req.params.id);
    if (parishWard) {
      res.json(parishWard);
    } else {
      res.status(404).json({ message: "Parish Ward not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new parish ward
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "ParishWard",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "Parish Ward creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      } else {
        const parishWard = await ParishWard.create({
          ...req.body,
          status: "approved",
          createdBy: req.user.id,
        });

        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "ParishWard",
          entityId: parishWard.id,
          newData: JSON.stringify(parishWard),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.status(201).json(parishWard);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a parish ward
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const parishWard = await ParishWard.findByPk(req.params.id);
      if (parishWard) {
        if (req.user.role !== "SuperAdmin" && parishWard.status === "approved") {
          return res.status(403).json({ message: "Cannot modify an approved parish ward" });
        }
        const oldData = JSON.stringify(parishWard);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "ParishWard",
            entityId: req.params.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Parish Ward update request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await parishWard.update({
            ...req.body,
            status: "approved",
            updatedBy: req.user.id,
          });

          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "ParishWard",
            entityId: parishWard.id,
            oldData: oldData,
            newData: JSON.stringify(parishWard),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json(parishWard);
        }
      } else {
        res.status(404).json({ message: "Parish Ward not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a parish ward
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const parishWard = await ParishWard.findByPk(req.params.id);
      if (parishWard) {
        if (req.user.role !== "SuperAdmin" && parishWard.status === "approved") {
          return res.status(403).json({ message: "Cannot delete an approved parish ward" });
        }
        const deletedData = JSON.stringify(parishWard);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "ParishWard",
            entityId: req.params.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Parish Ward deletion request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await parishWard.destroy();

          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "ParishWard",
            entityId: parishWard.id,
            oldData: deletedData,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json({ message: "Parish Ward deleted" });
        }
      } else {
        res.status(404).json({ message: "Parish Ward not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a parish ward (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const parishWard = await ParishWard.findByPk(req.params.id);
      if (parishWard) {
        const oldData = JSON.stringify(parishWard);
        await parishWard.update({ status: "approved", approvedBy: req.user.id });

        await AuditTrail.create({
          actionType: "APPROVE",
          entityType: "ParishWard",
          entityId: parishWard.id,
          oldData: oldData,
          newData: JSON.stringify(parishWard),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.json(parishWard);
      } else {
        res.status(404).json({ message: "Parish Ward not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all polling stations for a parish ward
router.get(
  "/:parishWardId/polling-stations",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const pollingStations = await PollingStation.findAll({
        where: { parishWardId: req.params.parishWardId },
      });
      res.json(pollingStations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a polling station in a parish ward
router.post(
  "/:parishWardId/polling-stations",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pollingStation = await PollingStation.create({
        ...req.body,
        parishWardId: req.params.parishWardId,
      });
      res.status(201).json(pollingStation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a polling station in a parish ward
router.put(
  "/:parishWardId/polling-stations/:pollingStationId",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pollingStation = await PollingStation.findOne({
        where: { id: req.params.pollingStationId, parishWardId: req.params.parishWardId },
      });

      if (!pollingStation) {
        return res.status(404).json({ message: "Polling station not found" });
      }

      const oldData = JSON.stringify(pollingStation);
      await pollingStation.update(req.body);

      await AuditTrail.create({
        actionType: "UPDATE",
        entityType: "PollingStation",
        entityId: pollingStation.id,
        oldData: oldData,
        newData: JSON.stringify(pollingStation),
        data: JSON.stringify(req.body),
        actionBy: req.user.id,
        status: "APPROVED",
      });

      res.json(pollingStation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a polling station in a parish ward
router.delete(
  "/:parishWardId/polling-stations/:pollingStationId",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pollingStation = await PollingStation.findOne({
        where: { id: req.params.pollingStationId, parishWardId: req.params.parishWardId },
      });

      if (!pollingStation) {
        return res.status(404).json({ message: "Polling station not found" });
      }

      const deletedData = JSON.stringify(pollingStation);
      await pollingStation.destroy();

      await AuditTrail.create({
        actionType: "DELETE",
        entityType: "PollingStation",
        entityId: pollingStation.id,
        oldData: deletedData,
        data: deletedData,
        actionBy: req.user.id,
        status: "APPROVED",
      });

      res.json({ message: "Polling station deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all registrars for a parish ward
router.get(
  "/:parishWardId/registrars",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const registrars = await ParishWardRegistra.findAll({
        where: { parishWardId: req.params.parishWardId },
      });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new registrar for a parish ward
router.post(
  "/:parishWardId/registrars",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const parishWard = await ParishWard.findByPk(req.params.parishWardId);
      if (!parishWard) {
        return res.status(404).json({ message: "Parish Ward not found" });
      }
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "ParishWardRegistra",
          data: JSON.stringify({ ...req.body, parishWardId: req.params.parishWardId }),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "Parish Ward registrar creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      } else {
        const registrar = await ParishWardRegistra.create({
          ...req.body,
          parishWardId: req.params.parishWardId,
        });
        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "ParishWardRegistra",
          entityId: registrar.id,
          newData: JSON.stringify(registrar),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });
        res.status(201).json(registrar);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Approve a parish ward registrar (SuperAdmin only)
router.put(
  "/:parishWardId/registrars/:registrarId/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const registrar = await ParishWardRegistra.findOne({
        where: { id: req.params.registrarId, parishWardId: req.params.parishWardId },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        await registrar.update({
          isActive: true,
          approvedBy: req.user.id,
          approvedAt: new Date(),
        });

        await AuditTrail.create({
          actionType: "APPROVE",
          entityType: "ParishWardRegistra",
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
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Add this new route to get parish/ward details
// Example of the updated parish/ward API response with hierarchy information
router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;
    const entity = await ParishWard.findByPk(id);
    
    if (!entity) {
      return res.status(404).json({ message: "Parish/Ward not found" });
    }

    // Get villages for this parish/ward
    const villages = await VillageCell.findAll({
      where: { parishWardId: id },
    });

    // Get the parent hierarchy
    const parentSubcounty = await SubcountyDivision.findByPk(entity.subcountyDivisionId);
    
    let parentConstituency = null;
    let parentDistrict = null;
    let parentSubregion = null;
    let parentRegion = null;
    
    if (parentSubcounty) {
      parentConstituency = await ConstituencyMunicipality.findByPk(parentSubcounty.constituencyDivisionId);
      
      if (parentConstituency) {
        parentDistrict = await District.findByPk(parentConstituency.districtId);
        
        if (parentDistrict) {
          parentSubregion = await Subregion.findByPk(parentDistrict.subregionId);
          
          if (parentSubregion) {
            parentRegion = await Region.findByPk(parentSubregion.regionId);
          }
        }
      }
    }

    const response = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      villagesCount: villages.length,
      villageBreakdown: villages.map(village => ({
        id: village.id,
        name: village.name
      })),
      // Add the complete hierarchy information
      hierarchy: {
        subcounty: parentSubcounty ? {
          id: parentSubcounty.id,
          name: parentSubcounty.name,
          type: parentSubcounty.type
        } : null,
        constituency: parentConstituency ? {
          id: parentConstituency.id,
          name: parentConstituency.name,
          type: parentConstituency.type
        } : null,
        district: parentDistrict ? {
          id: parentDistrict.id,
          name: parentDistrict.name
        } : null,
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
    console.error("Error in parish/ward details route:", error);
    res.status(500).json({
      message: "Error fetching details",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
