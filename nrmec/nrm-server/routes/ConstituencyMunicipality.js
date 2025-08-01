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

// Get all constituencies and municipalities
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const constituenciesMunicipalities =
      await ConstituencyMunicipality.findAll();
    res.json(constituenciesMunicipalities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific constituency or municipality
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const constituencyMunicipality = await ConstituencyMunicipality.findByPk(
      req.params.id
    );
    if (constituencyMunicipality) {
      res.json(constituencyMunicipality);
    } else {
      res
        .status(404)
        .json({ message: "Constituency or Municipality not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new constituency or municipality
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const { name, type } = req.body; // Ensure type is included
      if (!type || !["constituency", "municipality"].includes(type)) {
        return res
          .status(400)
          .json({
            message: "Type must be either 'constituency' or 'municipality'",
          });
      }

      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "ConstituencyMunicipality",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "Creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      } else {
        const constituencyMunicipality = await ConstituencyMunicipality.create({
          ...req.body,
          status: "approved",
          createdBy: req.user.id,
        });

        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "ConstituencyMunicipality",
          entityId: constituencyMunicipality.id,
          newData: JSON.stringify(constituencyMunicipality),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.status(201).json(constituencyMunicipality);
      }
    } catch (error) {
      console.error("Error creating constituency or municipality:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Update a constituency or municipality
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const constituencyMunicipality = await ConstituencyMunicipality.findByPk(
        req.params.id
      );
      if (constituencyMunicipality) {
        if (
          req.user.role !== "SuperAdmin" &&
          constituencyMunicipality.status === "approved"
        ) {
          return res
            .status(403)
            .json({ message: "Cannot modify an approved entity" });
        }
        const oldData = JSON.stringify(constituencyMunicipality);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "ConstituencyMunicipality",
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
          await constituencyMunicipality.update({
            ...req.body,
            status: "approved",
            updatedBy: req.user.id,
          });

          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "ConstituencyMunicipality",
            entityId: constituencyMunicipality.id,
            oldData: oldData,
            newData: JSON.stringify(constituencyMunicipality),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json(constituencyMunicipality);
        }
      } else {
        res
          .status(404)
          .json({ message: "Constituency or Municipality not found" });
      }
    } catch (error) {
      console.error("Error updating constituency or municipality:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Delete a constituency or municipality
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const constituencyMunicipality = await ConstituencyMunicipality.findByPk(
        req.params.id
      );
      if (constituencyMunicipality) {
        if (
          req.user.role !== "SuperAdmin" &&
          constituencyMunicipality.status === "approved"
        ) {
          return res
            .status(403)
            .json({ message: "Cannot delete an approved entity" });
        }
        const deletedData = JSON.stringify(constituencyMunicipality);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "ConstituencyMunicipality",
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
          await constituencyMunicipality.destroy();

          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "ConstituencyMunicipality",
            entityId: constituencyMunicipality.id,
            oldData: deletedData,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json({ message: "Constituency or Municipality deleted" });
        }
      } else {
        res
          .status(404)
          .json({ message: "Constituency or Municipality not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a constituency or municipality (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const constituencyMunicipality = await ConstituencyMunicipality.findByPk(
        req.params.id
      );
      if (constituencyMunicipality) {
        await constituencyMunicipality.update({
          status: "approved",
          approvedBy: req.user.id,
        });
        res.json(constituencyMunicipality);
      } else {
        res
          .status(404)
          .json({ message: "Constituency or Municipality not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Create a new registrar for a constituency or municipality
router.post(
  "/:constituencyMunicipalityId/registrars",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const constituencyMunicipality = await ConstituencyMunicipality.findByPk(
        req.params.constituencyMunicipalityId
      );
      if (!constituencyMunicipality) {
        return res
          .status(404)
          .json({ message: "Constituency or Municipality not found" });
      }
      const registrar = await ConstituencyMunicipalityRegistra.create({
        ...req.body,
        constituencyMunicipalityId: req.params.constituencyMunicipalityId,
      });

      // Create audit trail entry
      await AuditTrail.create({
        actionType: "CREATE",
        entityType: "ConstituencyRegistra",
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

// Get registrars for a constituency or municipality
router.get(
  "/:constituencyMunicipalityId/registrars",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const registrars = await ConstituencyMunicipalityRegistra.findAll({
        where: {
          constituencyMunicipalityId: req.params.constituencyMunicipalityId,
        },
      });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update a constituency registrar
router.put(
  "/:constituencyMunicipalityId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await ConstituencyMunicipalityRegistra.findOne({
        where: {
          id: req.params.registrarId,
          constituencyMunicipalityId: req.params.constituencyMunicipalityId,
        },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        await registrar.update(req.body);

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "UPDATE",
          entityType: "ConstituencyRegistra",
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

// Delete a constituency registrar
router.delete(
  "/:constituencyMunicipalityId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await ConstituencyMunicipalityRegistra.findOne({
        where: {
          id: req.params.registrarId,
          constituencyMunicipalityId: req.params.constituencyMunicipalityId,
        },
      });
      if (registrar) {
        const deletedData = JSON.stringify(registrar);
        await registrar.destroy();

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "DELETE",
          entityType: "ConstituencyRegistra",
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

// Add this new route to get constituency/municipality details
router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;
    const entity = await ConstituencyMunicipality.findByPk(id);
    
    if (!entity) {
      return res.status(404).json({ message: "Constituency/Municipality not found" });
    }

    // Get the parent district
    const parentDistrict = await District.findByPk(entity.districtId);
    
    // Get the parent subregion
    const parentSubregion = parentDistrict 
      ? await Subregion.findByPk(parentDistrict.subregionId) 
      : null;
    
    // Get the parent region
    const parentRegion = parentSubregion 
      ? await Region.findByPk(parentSubregion.regionId) 
      : null;

    // Get subcounties for this constituency/municipality
    const subcounties = await SubcountyDivision.findAll({
      where: { constituencyDivisionId: id },
    });

    // Calculate breakdown for each subcounty
    const subcountyBreakdown = await Promise.all(
      subcounties.map(async (subcounty) => {
        // Get parishes for this subcounty
        const parishes = await ParishWard.findAll({
          where: { subcountyDivisionId: subcounty.id },
        });

        // Get villages for these parishes
        const villages = await VillageCell.findAll({
          where: { parishWardId: parishes.map((p) => p.id) },
        });

        return {
          id: subcounty.id,
          name: subcounty.name,
          type: subcounty.type,
          parishesCount: parishes.length,
          villagesCount: villages.length,
        };
      })
    );

    // Calculate total counts
    const totalCounts = subcountyBreakdown.reduce(
      (acc, curr) => ({
        parishesCount: acc.parishesCount + curr.parishesCount,
        villagesCount: acc.villagesCount + curr.villagesCount,
      }),
      { parishesCount: 0, villagesCount: 0 }
    );

    const response = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      subcountiesCount: subcounties.length,
      parishesCount: totalCounts.parishesCount,
      villagesCount: totalCounts.villagesCount,
      // Include hierarchy information
      hierarchy: {
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
      },
      subcountyBreakdown,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in constituency/municipality details route:", error);
    res.status(500).json({
      message: "Error fetching constituency/municipality details",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
module.exports = router;
