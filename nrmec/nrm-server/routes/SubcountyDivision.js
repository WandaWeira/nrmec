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

// Get all subcounties and divisions
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const subcountyDivisions = await SubcountyDivision.findAll();
    res.json(subcountyDivisions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific subcounty or division
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const subcountyDivision = await SubcountyDivision.findByPk(req.params.id);
    if (subcountyDivision) {
      res.json(subcountyDivision);
    } else {
      res.status(404).json({ message: "Subcounty or Division not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new subcounty or division
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const { name, type } = req.body; // Ensure type is included
      if (!type || !["subcounty", "division"].includes(type)) {
        return res
          .status(400)
          .json({ message: "Type must be either 'subcounty' or 'division'" });
      }

      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "SubcountyDivision",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "Creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      } else {
        const subcountyDivision = await SubcountyDivision.create({
          ...req.body,
          status: "approved",
          createdBy: req.user.id,
        });

        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "SubcountyDivision",
          entityId: subcountyDivision.id,
          newData: JSON.stringify(subcountyDivision),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.status(201).json(subcountyDivision);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a subcounty or division
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const subcountyDivision = await SubcountyDivision.findByPk(req.params.id);
      if (subcountyDivision) {
        if (
          req.user.role !== "SuperAdmin" &&
          subcountyDivision.status === "approved"
        ) {
          return res
            .status(403)
            .json({ message: "Cannot modify an approved entity" });
        }
        const oldData = JSON.stringify(subcountyDivision);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "SubcountyDivision",
            entityId: req.params.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Update request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await subcountyDivision.update({
            ...req.body,
            status: "approved",
            updatedBy: req.user.id,
          });

          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "SubcountyDivision",
            entityId: subcountyDivision.id,
            oldData: oldData,
            newData: JSON.stringify(subcountyDivision),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json(subcountyDivision);
        }
      } else {
        res.status(404).json({ message: "Subcounty or Division not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a subcounty or division
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const subcountyDivision = await SubcountyDivision.findByPk(req.params.id);
      if (subcountyDivision) {
        if (
          req.user.role !== "SuperAdmin" &&
          subcountyDivision.status === "approved"
        ) {
          return res
            .status(403)
            .json({ message: "Cannot delete an approved entity" });
        }
        const deletedData = JSON.stringify(subcountyDivision);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "SubcountyDivision",
            entityId: req.params.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Deletion request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await subcountyDivision.destroy();

          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "SubcountyDivision",
            entityId: subcountyDivision.id,
            oldData: deletedData,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json({ message: "Subcounty or Division deleted" });
        }
      } else {
        res.status(404).json({ message: "Subcounty or Division not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a subcounty or division (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const subcountyDivision = await SubcountyDivision.findByPk(req.params.id);
      if (subcountyDivision) {
        await subcountyDivision.update({
          status: "approved",
          approvedBy: req.user.id,
        });
        res.json(subcountyDivision);
      } else {
        res.status(404).json({ message: "Subcounty or Division not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all registrars for a subcounty or division
router.get(
  "/:subcountyDivisionId/registrars",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const registrars = await SubcountyDivisionRegistra.findAll({
        where: { subcountyDivisionId: req.params.subcountyDivisionId },
      });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new registrar for a subcounty or division
router.post(
  "/:subcountyDivisionId/registrars",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const subcountyDivision = await SubcountyDivision.findByPk(
        req.params.subcountyDivisionId
      );
      if (!subcountyDivision) {
        return res
          .status(404)
          .json({ message: "Subcounty or Division not found" });
      }
      const registrar = await SubcountyDivisionRegistra.create({
        ...req.body,
        subcountyDivisionId: req.params.subcountyDivisionId,
      });

      // Create audit trail entry
      await AuditTrail.create({
        actionType: "CREATE",
        entityType: "SubcountyDivisionRegistra",
        entityId: registrar.id,
        newData: JSON.stringify(registrar),
        data: JSON.stringify(req.body),
        actionBy: req.user.id,
        status: "PENDING",
      });

      res.status(201).json(registrar);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a registrar for a subcounty or division
router.put(
  "/:subcountyDivisionId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await SubcountyDivisionRegistra.findOne({
        where: {
          id: req.params.registrarId,
          subcountyDivisionId: req.params.subcountyDivisionId,
        },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        await registrar.update(req.body);

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "UPDATE",
          entityType: "SubcountyDivisionRegistra",
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
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a registrar for a subcounty or division
router.delete(
  "/:subcountyDivisionId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await SubcountyDivisionRegistra.findOne({
        where: {
          id: req.params.registrarId,
          subcountyDivisionId: req.params.subcountyDivisionId,
        },
      });
      if (registrar) {
        const deletedData = JSON.stringify(registrar);
        await registrar.destroy();

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "DELETE",
          entityType: "SubcountyDivisionRegistra",
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
      res.status(500).json({ message: error.message });
    }
  }
);

// Add this new route to get subcounty/division details
router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;
    const entity = await SubcountyDivision.findByPk(id);
    
    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }

    // Get parent hierarchy information
    const parentConstituency = await ConstituencyMunicipality.findByPk(entity.constituencyDivisionId);
    let parentDistrict = null;
    let parentSubregion = null;
    let parentRegion = null;

    if (parentConstituency) {
      parentDistrict = await District.findByPk(parentConstituency.districtId);
      
      if (parentDistrict) {
        parentSubregion = await Subregion.findByPk(parentDistrict.subregionId);
        
        if (parentSubregion) {
          parentRegion = await Region.findByPk(parentSubregion.regionId);
        }
      }
    }

    // Get parishes for this subcounty/division
    const parishes = await ParishWard.findAll({
      where: { subcountyDivisionId: id },
    });

    // Calculate breakdown for each parish
    const parishBreakdown = await Promise.all(
      parishes.map(async (parish) => {
        // Get villages for this parish
        const villages = await VillageCell.findAll({
          where: { parishWardId: parish.id },
        });

        return {
          id: parish.id,
          name: parish.name,
          type: parish.type,
          villagesCount: villages.length,
        };
      })
    );

    // Calculate total counts
    const totalCounts = parishBreakdown.reduce(
      (acc, curr) => ({
        villagesCount: acc.villagesCount + curr.villagesCount,
      }),
      { villagesCount: 0 }
    );

    const response = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      parishesCount: parishes.length,
      villagesCount: totalCounts.villagesCount,
      parishBreakdown,
      // Add hierarchy information
      hierarchy: {
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
    console.error("Error in subcounty/division details route:", error);
    res.status(500).json({
      message: "Error fetching details",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
module.exports = router;
