const express = require("express");
const router = express.Router();
const {
  Ward,
  PollingStation,
  WardRegistra,
  AuditTrail,
  PendingAction,
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Get all wards
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const wards = await Ward.findAll();
    res.json(wards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific ward
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const ward = await Ward.findByPk(req.params.id);
    if (ward) {
      res.json(ward);
    } else {
      res.status(404).json({ message: "Ward not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new ward
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "Ward",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res
          .status(202)
          .json({
            message: "Ward creation request submitted for approval",
            pendingActionId: pendingAction.id,
          });
      } else {
        const ward = await Ward.create({
          ...req.body,
          status: "approved",
          createdBy: req.user.id,
        });

        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "Ward",
          entityId: ward.id,
          newData: JSON.stringify(ward),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.status(201).json(ward);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a ward
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const ward = await Ward.findByPk(req.params.id);
      if (ward) {
        if (req.user.role !== "SuperAdmin" && ward.status === "approved") {
          return res
            .status(403)
            .json({ message: "Cannot modify an approved ward" });
        }
        const oldData = JSON.stringify(ward);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "Ward",
            entityId: req.params.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Ward update request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await ward.update({
            ...req.body,
            status: "approved",
            updatedBy: req.user.id,
          });

          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "Ward",
            entityId: ward.id,
            oldData: oldData,
            newData: JSON.stringify(ward),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json(ward);
        }
      } else {
        res.status(404).json({ message: "Ward not found" });
      }
    } catch (error) {
      console.error("Error details:", error);
      res.status(400).json({ message: error.message, stack: error.stack });
    }
  }
);

// Delete a ward
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const ward = await Ward.findByPk(req.params.id);
      if (ward) {
        if (req.user.role !== "SuperAdmin" && ward.status === "approved") {
          return res
            .status(403)
            .json({ message: "Cannot delete an approved ward" });
        }
        const deletedData = JSON.stringify(ward);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "Ward",
            entityId: req.params.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Ward deletion request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await ward.destroy();

          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "Ward",
            entityId: ward.id,
            oldData: deletedData,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });

          res.json({ message: "Ward deleted" });
        }
      } else {
        res.status(404).json({ message: "Ward not found" });
      }
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ message: error.message, stack: error.stack });
    }
  }
);

// Approve a ward (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const ward = await Ward.findByPk(req.params.id);
      if (ward) {
        const oldData = JSON.stringify(ward);
        await ward.update({ status: "approved", approvedBy: req.user.id });

        await AuditTrail.create({
          actionType: "APPROVE",
          entityType: "Ward",
          entityId: ward.id,
          oldData: oldData,
          newData: JSON.stringify(ward),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });

        res.json(ward);
      } else {
        res.status(404).json({ message: "Ward not found" });
      }
    } catch (error) {
      console.error("Error details:", error);
      res.status(400).json({ message: error.message, stack: error.stack });
    }
  }
);

// Get all polling stations for a ward
router.get(
  "/:wardId/polling-stations",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pollingStations = await PollingStation.findAll({
        where: { wardId: req.params.wardId },
      });
      res.json(pollingStations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a polling station in a ward
router.post(
  "/:wardId/polling-stations",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pollingStation = await PollingStation.create({
        ...req.body,
        wardId: req.params.wardId,
      });
      res.status(201).json(pollingStation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a polling station in a ward
router.put(
  "/:wardId/polling-stations/:pollingStationId",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pollingStation = await PollingStation.findOne({
        where: { id: req.params.pollingStationId, wardId: req.params.wardId },
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
      console.error("Error details:", error);
      res.status(400).json({ message: error.message, stack: error.stack });
    }
  }
);

// Delete a polling station in a ward
router.delete(
  "/:wardId/polling-stations/:pollingStationId",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pollingStation = await PollingStation.findOne({
        where: { id: req.params.pollingStationId, wardId: req.params.wardId },
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
      console.error("Error details:", error);
      res.status(500).json({ message: error.message, stack: error.stack });
    }
  }
);

// Get all registrars for a ward
router.get(
  "/:wardId/registrars",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const registrars = await WardRegistra.findAll({
        where: { wardId: req.params.wardId },
      });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new registrar for a ward
router.post(
  "/:wardId/registrars",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const ward = await Ward.findByPk(req.params.wardId);
      if (!ward) {
        return res.status(404).json({ message: "Ward not found" });
      }
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "WardRegistra",
          data: JSON.stringify({ ...req.body, wardId: req.params.wardId }),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res
          .status(202)
          .json({
            message: "Ward registrar creation request submitted for approval",
            pendingActionId: pendingAction.id,
          });
      } else {
        const registrar = await WardRegistra.create({
          ...req.body,
          wardId: req.params.wardId,
        });
        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "WardRegistra",
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

// Update a ward registrar
router.put(
  "/:wardId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await WardRegistra.findOne({
        where: { id: req.params.registrarId, wardId: req.params.wardId },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "WardRegistra",
            entityId: registrar.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Ward registrar update request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await registrar.update(req.body);
          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "WardRegistra",
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

// Delete a ward registrar
router.delete(
  "/:wardId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await WardRegistra.findOne({
        where: { id: req.params.registrarId, wardId: req.params.wardId },
      });
      if (registrar) {
        const deletedData = JSON.stringify(registrar);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "WardRegistra",
            entityId: registrar.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Ward registrar deletion request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await registrar.destroy();
          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "WardRegistra",
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

// Approve a ward registrar (SuperAdmin only)
router.put(
  "/:wardId/registrars/:registrarId/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const registrar = await WardRegistra.findOne({
        where: { id: req.params.registrarId, wardId: req.params.wardId },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        await registrar.update({
          isApproved: true,
          approvedBy: req.user.id,
          approvedAt: new Date(),
        });

        await AuditTrail.create({
          actionType: "APPROVE",
          entityType: "WardRegistra",
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
      console.error("Error approving ward registrar:", error);
      res.status(400).json({
        message: error.message,
        details: error.errors,
        stack: error.stack,
      });
    }
  }
);

module.exports = router;
