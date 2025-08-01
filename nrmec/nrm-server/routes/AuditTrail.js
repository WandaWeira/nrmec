const express = require("express");
const router = express.Router();
const { AuditTrail } = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");
const { User } = require("../models");

router.get("/", authMiddleware, checkPermission("SuperAdmin"), async (req, res) => {

  try {
  
    const auditTrail = await AuditTrail.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'actionByUser', attributes: ['id', 'firstName', 'lastName'], required: false },
        { model: User, as: 'approvedByUser', attributes: ['id', 'firstName', 'lastName'], required: false }
      ],
      attributes: ['id', 'actionType', 'entityType', 'entityId', 'data', 'status', 'createdAt', 'actionBy', 'approvedBy']
    });
   
    if (auditTrail.length === 0) {
      // console.log("No audit trail entries found in the database");
    }
    res.json(auditTrail);
  } catch (error) {
    console.error("Error in audit trail route:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

module.exports = router;
