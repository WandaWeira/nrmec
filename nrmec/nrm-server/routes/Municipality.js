const express = require("express");
const router = express.Router();
const {
  Municipality,
  AuditTrail,
  PendingAction,
  MunicipalityRegistra,
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Get all municipalities
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const municipalities = await Municipality.findAll();
    res.json(municipalities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific municipality
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const municipality = await Municipality.findByPk(req.params.id);
    if (municipality) {
      res.json(municipality);
    } else {
      res.status(404).json({ message: "Municipality not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new municipality
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "Municipality",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res.status(202).json({
          message: "Municipality creation request submitted for approval",
          pendingActionId: pendingAction.id,
        });
      } else {
        const municipality = await Municipality.create({
          ...req.body,
          status: "approved",
          createdBy: req.user.id,
        });

        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "Municipality",
          entityId: municipality.id,
          newData: JSON.stringify(municipality),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.status(201).json(municipality);
      }
    } catch (error) {
      console.error("Error creating municipality:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Update a municipality
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const municipality = await Municipality.findByPk(req.params.id);
      if (municipality) {
        if (
          req.user.role !== "SuperAdmin" &&
          municipality.status === "approved"
        ) {
          return res
            .status(403)
            .json({ message: "Cannot modify an approved municipality" });
        }
        const oldData = JSON.stringify(municipality);
        if (req.user.role !== "SuperAdmin") {
          if (!req.body.name) {
            return res
              .status(400)
              .json({ message: "Municipality name is required" });
          }
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "Municipality",
            entityId: req.params.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Municipality update request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await municipality.update({
            ...req.body,
            status: "approved",
            updatedBy: req.user.id,
          });

          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "Municipality",
            entityId: municipality.id,
            oldData: oldData,
            newData: JSON.stringify(municipality),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json(municipality);
        }
      } else {
        res.status(404).json({ message: "Municipality not found" });
      }
    } catch (error) {
      console.error("Error updating municipality:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

// Delete a municipality
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const municipality = await Municipality.findByPk(req.params.id);
      if (municipality) {
        if (
          req.user.role !== "SuperAdmin" &&
          municipality.status === "approved"
        ) {
          return res
            .status(403)
            .json({ message: "Cannot delete an approved municipality" });
        }
        const deletedData = JSON.stringify(municipality);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "Municipality",
            entityId: req.params.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res.status(202).json({
            message: "Municipality deletion request submitted for approval",
            pendingActionId: pendingAction.id,
          });
        } else {
          await municipality.destroy();

          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "Municipality",
            entityId: municipality.id,
            oldData: deletedData,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json({ message: "Municipality deleted" });
        }
      } else {
        res.status(404).json({ message: "Municipality not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a municipality (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const municipality = await Municipality.findByPk(req.params.id);
      if (municipality) {
        await municipality.update({
          status: "approved",
          approvedBy: req.user.id,
        });
        res.json(municipality);
      } else {
        res.status(404).json({ message: "Municipality not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get(
  "/:municipalityId/registrars",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const registrars = await MunicipalityRegistra.findAll({
        where: { municipalityId: req.params.municipalityId },
      });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new registrar for a municipality
router.post(
  "/:municipalityId/registrars",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const municipality = await Municipality.findByPk(
        req.params.municipalityId
      );
      if (!municipality) {
        return res.status(404).json({ message: "Municipality not found" });
      }
      const registrar = await MunicipalityRegistra.create({
        ...req.body,
        municipalityId: req.params.municipalityId,
      });

      // Create audit trail entry
      await AuditTrail.create({
        actionType: "CREATE",
        entityType: "MunicipalityRegistra",
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

// Update a municipality registrar
router.put(
  "/:municipalityId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await MunicipalityRegistra.findOne({
        where: {
          id: req.params.registrarId,
          municipalityId: req.params.municipalityId,
        },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        await registrar.update(req.body);

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "UPDATE",
          entityType: "MunicipalityRegistra",
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

// Delete a municipality registrar
router.delete(
  "/:municipalityId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await MunicipalityRegistra.findOne({
        where: {
          id: req.params.registrarId,
          municipalityId: req.params.municipalityId,
        },
      });
      if (registrar) {
        const deletedData = JSON.stringify(registrar);
        await registrar.destroy();

        // Create audit trail entry
        await AuditTrail.create({
          actionType: "DELETE",
          entityType: "MunicipalityRegistra",
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

module.exports = router;
