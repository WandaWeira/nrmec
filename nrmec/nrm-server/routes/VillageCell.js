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
const { Op } = require("sequelize");

// Get all village cells

 

  router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
 
    try {
      const { page, limit, search } = req.query;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
  
      // Import Sequelize at the top of your file if you haven't already
      const { Op, Sequelize } = require("sequelize");
  
      const whereClause = search
        ? {
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('name')),
                'LIKE',
                `%${search.toLowerCase()}%`
              )
            ],
          }
        : {};
  
      const { count, rows: villageCells } = await VillageCell.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [["name", "ASC"]],
      });
  
      res.json({
        villageCells,
        totalCount: count,
        currentPage: pageNum,
        totalPages: Math.ceil(count / limitNum),
      });
    } catch (error) {
      console.error("Error fetching village cells:", error);
      res.status(500).json({
        message: "Failed to fetch village cells",
        error: error.message,
      });
    }
  });
 

// Get a specific village cell
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    console.log("******",req.params.id)
    const villageCell = await VillageCell.findByPk(req.params.id);
    if (villageCell) {
      console.log(villageCell)
      res.json(villageCell);
    } else {
      res.status(404).json({ message: "Village Cell not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new village cell
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "VillageCell",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "Village Cell creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      } else {
        const villageCell = await VillageCell.create({
          ...req.body,
          status: "approved",
          createdBy: req.user.id,
        });

        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "VillageCell",
          entityId: villageCell.id,
          newData: JSON.stringify(villageCell),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.status(201).json(villageCell);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a village cell
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const villageCell = await VillageCell.findByPk(req.params.id);
      if (villageCell) {
        if (
          req.user.role !== "SuperAdmin" &&
          villageCell.status === "approved"
        ) {
          return res
            .status(403)
            .json({ message: "Cannot modify an approved village cell" });
        }
        const oldData = JSON.stringify(villageCell);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "VillageCell",
            entityId: villageCell.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Village Cell update request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await villageCell.update({
            ...req.body,
            status: "approved",
            updatedBy: req.user.id,
          });
          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "VillageCell",
            entityId: villageCell.id,
            oldData: oldData,
            newData: JSON.stringify(villageCell),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });
          res.json(villageCell);
        }
      } else {
        res.status(404).json({ message: "Village Cell not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a village cell
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const villageCell = await VillageCell.findByPk(req.params.id);
      if (villageCell) {
        if (
          req.user.role !== "SuperAdmin" &&
          villageCell.status === "approved"
        ) {
          return res
            .status(403)
            .json({ message: "Cannot delete an approved village cell" });
        }
        const deletedData = JSON.stringify(villageCell);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "VillageCell",
            entityId: villageCell.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Village Cell deletion request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await villageCell.destroy();
          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "VillageCell",
            entityId: villageCell.id,
            oldData: deletedData,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });
          res.json({ message: "Village Cell deleted" });
        }
      } else {
        res.status(404).json({ message: "Village Cell not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a village cell (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const villageCell = await VillageCell.findByPk(req.params.id);
      if (villageCell) {
        await villageCell.update({
          status: "approved",
          approvedBy: req.user.id,
        });
        res.json(villageCell);
      } else {
        res.status(404).json({ message: "Village Cell not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all registrars for a village cell
router.get(
  "/:cellId/registrars",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const registrars = await VillageCellRegistra.findAll({
        where: { villageCellId: req.params.cellId },
      });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new registrar for a village cell
router.post(
  "/:cellId/registrars",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const villageCell = await VillageCell.findByPk(req.params.cellId);
      if (!villageCell) {
        return res.status(404).json({ message: "Village Cell not found" });
      }
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "VillageCellRegistra",
          data: JSON.stringify({
            ...req.body,
            villageCellId: req.params.cellId,
          }),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message:
            "Village Cell registrar creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      } else {
        const registrar = await VillageCellRegistra.create({
          ...req.body,
          villageCellId: req.params.cellId,
        });
        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "VillageCellRegistra",
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

// Update a village cell registrar
router.put(
  "/:cellId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await VillageCellRegistra.findOne({
        where: { id: req.params.registrarId, villageCellId: req.params.cellId },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "VillageCellRegistra",
            entityId: registrar.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message:
              "Village Cell registrar update request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await registrar.update(req.body);
          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "VillageCellRegistra",
            entityId: registrar.id,
            oldData: oldData,
            newData: JSON.stringify(registrar),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });
          res.json(registrar);
        }
      } else {
        res.status(404).json({ message: "Registrar not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a village cell registrar
router.delete(
  "/:cellId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await VillageCellRegistra.findOne({
        where: { id: req.params.registrarId, villageCellId: req.params.cellId },
      });
      if (registrar) {
        const deletedData = JSON.stringify(registrar);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "VillageCellRegistra",
            entityId: registrar.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message:
              "Village Cell registrar deletion request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await registrar.destroy();
          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "VillageCellRegistra",
            entityId: registrar.id,
            oldData: deletedData,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });
          res.json({ message: "Registrar deleted" });
        }
      } else {
        res.status(404).json({ message: "Registrar not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);



router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;
    const entity = await VillageCell.findByPk(id);
    
    if (!entity) {
      return res.status(404).json({ message: "Village/Cell not found" });
    }

    // Get the parent parish/ward
    const parentParish = await ParishWard.findByPk(entity.parishWardId);
    
    // Get the parent subcounty/division
    const parentSubcounty = parentParish 
      ? await SubcountyDivision.findByPk(parentParish.subcountyDivisionId) 
      : null;
    
    // Get the parent constituency/municipality
    const parentConstituency = parentSubcounty 
      ? await ConstituencyMunicipality.findByPk(parentSubcounty.constituencyDivisionId) 
      : null;
    
    // Get the parent district
    const parentDistrict = parentConstituency 
      ? await District.findByPk(parentConstituency.districtId) 
      : null;
    
    // Get the parent subregion
    const parentSubregion = parentDistrict 
      ? await Subregion.findByPk(parentDistrict.subregionId) 
      : null;
    
    // Get the parent region
    const parentRegion = parentSubregion 
      ? await Region.findByPk(parentSubregion.regionId) 
      : null;

    

    const response = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      // Include hierarchy information
      hierarchy: {
        parish: parentParish ? {
          id: parentParish.id,
          name: parentParish.name,
          type: parentParish.type
        } : null,
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
    console.error("Error in village/cell details route:", error);
    res.status(500).json({
      message: "Error fetching village/cell details",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

router.get("/all", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const villageCells = await VillageCell.findAll({
      order: [["name", "ASC"]],
    });
    res.json(villageCells);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get villages by parish ID - new endpoint for filtering
router.get("/by-parish/:parishId", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const { parishId } = req.params;
    
    const villageCells = await VillageCell.findAll({
      where: { parishWardId: parishId },
      order: [["name", "ASC"]],
    });
    
    res.json({
      villageCells,
      totalCount: villageCells.length,
    });
  } catch (error) {
    console.error("Error fetching villages by parish:", error);
    res.status(500).json({
      message: "Failed to fetch villages by parish",
      error: error.message,
    });
  }
});

module.exports = router;
