const express = require("express");
const router = express.Router();
const { Cell, CellRegistra, AuditTrail, PendingAction } = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Get all cells
router.get("/", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const cells = await Cell.findAll();
    res.json(cells);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific cell
router.get("/:id", authMiddleware, checkPermission("PEO"), async (req, res) => {
  try {
    const cell = await Cell.findByPk(req.params.id);
    if (cell) {
      res.json(cell);
    } else {
      res.status(404).json({ message: "Cell not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new cell
router.post(
  "/",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "Cell",
          data: JSON.stringify(req.body),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res
          .status(202)
          .json({
            message: "Cell creation request submitted for approval",
            pendingActionId: pendingAction.id,
          });
      } else {
        const cell = await Cell.create({
          ...req.body,
          status: "approved",
          createdBy: req.user.id,
        });
        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "Cell",
          entityId: cell.id,
          newData: JSON.stringify(cell),
          data: JSON.stringify(req.body),
          actionBy: req.user.id,
          status: "APPROVED",
        });
        res.status(201).json(cell);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a cell
router.put(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const cell = await Cell.findByPk(req.params.id);
      if (cell) {
        if (req.user.role !== "SuperAdmin" && cell.status === "approved") {
          return res
            .status(403)
            .json({ message: "Cannot modify an approved cell" });
        }
        const oldData = JSON.stringify(cell);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "Cell",
            entityId: cell.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Cell update request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await cell.update({
            ...req.body,
            status: "approved",
            updatedBy: req.user.id,
          });
          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "Cell",
            entityId: cell.id,
            oldData: oldData,
            newData: JSON.stringify(cell),
            data: JSON.stringify(req.body),
            actionBy: req.user.id,
            status: "APPROVED",
          });
          res.json(cell);
        }
      } else {
        res.status(404).json({ message: "Cell not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a cell
router.delete(
  "/:id",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
  async (req, res) => {
    try {
      const cell = await Cell.findByPk(req.params.id);
      if (cell) {
        if (req.user.role !== "SuperAdmin" && cell.status === "approved") {
          return res
            .status(403)
            .json({ message: "Cannot delete an approved cell" });
        }
        const deletedData = JSON.stringify(cell);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "Cell",
            entityId: cell.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Cell deletion request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await cell.destroy();
          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "Cell",
            entityId: cell.id,
            oldData: deletedData,
            data: deletedData,
            actionBy: req.user.id,
            status: "APPROVED",
          });
          res.json({ message: "Cell deleted" });
        }
      } else {
        res.status(404).json({ message: "Cell not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve a cell (SuperAdmin only)
router.put(
  "/:id/approve",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const cell = await Cell.findByPk(req.params.id);
      if (cell) {
        await cell.update({ status: "approved", approvedBy: req.user.id });
        res.json(cell);
      } else {
        res.status(404).json({ message: "Cell not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// ... existing code ...

// Get all registrars for a cell
router.get(
  "/:cellId/registrars",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const registrars = await CellRegistra.findAll({
        where: { cellId: req.params.cellId },
      });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new registrar for a cell
router.post(
  "/:cellId/registrars",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const cell = await Cell.findByPk(req.params.cellId);
      if (!cell) {
        return res.status(404).json({ message: "Cell not found" });
      }
      if (req.user.role !== "SuperAdmin") {
        const pendingAction = await PendingAction.create({
          actionType: "CREATE",
          entityType: "CellRegistra",
          data: JSON.stringify({ ...req.body, cellId: req.params.cellId }),
          requestedBy: req.user.id,
          status: "PENDING",
        });
        res
          .status(202)
          .json({
            message: "Cell registrar creation request submitted for approval",
            pendingActionId: pendingAction.id,
          });
      } else {
        const registrar = await CellRegistra.create({
          ...req.body,
          cellId: req.params.cellId,
        });
        await AuditTrail.create({
          actionType: "CREATE",
          entityType: "CellRegistra",
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

// Update a cell registrar
router.put(
  "/:cellId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await CellRegistra.findOne({
        where: { id: req.params.registrarId, cellId: req.params.cellId },
      });
      if (registrar) {
        const oldData = JSON.stringify(registrar);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "UPDATE",
            entityType: "CellRegistra",
            entityId: registrar.id,
            data: JSON.stringify(req.body),
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Cell registrar update request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await registrar.update(req.body);
          await AuditTrail.create({
            actionType: "UPDATE",
            entityType: "CellRegistra",
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

// Delete a cell registrar
router.delete(
  "/:cellId/registrars/:registrarId",
  authMiddleware,
  checkPermission(["SuperAdmin", "DistrictRegistra"]),
  async (req, res) => {
    try {
      const registrar = await CellRegistra.findOne({
        where: { id: req.params.registrarId, cellId: req.params.cellId },
      });
      if (registrar) {
        const deletedData = JSON.stringify(registrar);
        if (req.user.role !== "SuperAdmin") {
          const pendingAction = await PendingAction.create({
            actionType: "DELETE",
            entityType: "CellRegistra",
            entityId: registrar.id,
            data: deletedData,
            requestedBy: req.user.id,
            status: "PENDING",
          });
          res
            .status(202)
            .json({
              message: "Cell registrar deletion request submitted for approval",
              pendingActionId: pendingAction.id,
            });
        } else {
          await registrar.destroy();
          await AuditTrail.create({
            actionType: "DELETE",
            entityType: "CellRegistra",
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

// ... existing code ...

module.exports = router;
