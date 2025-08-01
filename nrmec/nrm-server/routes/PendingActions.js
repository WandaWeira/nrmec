const express = require("express");
const router = express.Router();
const {
  PendingAction,
  AuditTrail,
  Region,
  Candidate,
  OppositionCandidate,
  NationalCandidate,
  VillageCellCandidate,
  ParishesWardsCandidate,
  SubcountiesDivisionsCandidate,
  ConstituencyMunicipalityCandidate,
  DistrictCandidate,
  NationalOppositionCandidate,
  DistrictOppositionCandidate,
  ConstituencyMunicipalityOppositionCandidate,
  SubcountiesDivisionsOppositionCandidate,
  ParishesWardsOppositionCandidate,
  VillageCellOppositionCandidate,
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");
const { sequelize } = require("../models");
// Import other models as needed

const {
  District,
  Constituency,
  Subcounty,
  Parish,
  Village,
  Cell,
  Subregion,
  // NationalCandidate,
  // ConstituencyMunicipalityCandidate,
  // VillageCellCandidate,
  // ParishesWardsCandidate
} = require("../models");

const getElectoralPositionModel = (entityType, data) => {
  if (entityType.toLowerCase() === "electoral-positions") {
    if (data.districtElectionType === "partyStructure") {
      return DistrictCandidate;
    } else if (data.constituencyMunicipalityElectionType === "mps") {
      return ConstituencyMunicipalityCandidate;
    } else if (data.villageCellElectionType === "lc1") {
      return VillageCellCandidate;
    } else if (data.parishwardElectionType === "partyStructure") {
      return ParishesWardsCandidate;
    } else if (data.subcountiesDivisionsElectionType === "lc3") {
      return SubcountiesDivisionsCandidate;
    } else if (data.districtElectionType === "lcv") {
      return DistrictCandidate;
    } else if (data.districtElectionType === "DistrictCouncillors") {
      return DistrictCandidate;
    } else if (data.districtElectionType === "DistrictSIGCouncillors") {
      return DistrictCandidate;
    } else if (data.subcountiesDivisionsElectionType === "partyStructure") {
      return SubcountiesDivisionsCandidate;
    } else if (
      data.subcountiesDivisionsElectionType === "SubcountyCouncillors"
    ) {
      return SubcountiesDivisionsCandidate;
    } else if (
      data.subcountiesDivisionsElectionType === "SubcountySIGCouncillors"
    ) {
      return SubcountiesDivisionsCandidate;
    } else if (data.parishwardElectionType === "lc2") {
      return ParishesWardsCandidate;
    } else if (data.villageCellElectionType === "partyStructure") {
      return VillageCellCandidate;
    }
    throw new Error(`Invalid electoral position type`);
  }
  // Existing switch statement for other entity types
  switch (entityType.toLowerCase()) {
    case "districts":
      return District;
    case "constituencies":
      return Constituency;
    case "subcounties":
      return Subcounty;
    case "parishes":
      return Parish;
    case "villages":
      return Village;
    default:
      throw new Error(`Invalid entity type: ${entityType}`);
  }
};

// function determineModelName(data) {
//   if (data.districtElectionType === "lcv") {
//     return "district-candidates";
//   } else if (data.districtElectionType === "partyStructure") {
//     return "district-candidates";
//   } else if (data.villageCellElectionType === "lc1") {
//     return "village-cell-candidates";
//   } else if (data.constituencyMunicipalityElectionType) {
//     return "constituency-municipality-candidates";
//   } else if (data.subcountiesDivisionsElectionType) {
//     return "subcounties-divisions-candidates";
//   } else if (data.parishesWardsElectionType) {
//     return "parishes-wards-candidates";
//   }
//   // Add more conditions for other types if needed
//   return "national-candidates"; // Default case
// }

// Get all pending actions
router.get(
  "/",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    try {
      const pendingActions = await PendingAction.findAll({
        where: { status: "PENDING" },
      });
      res.json(pendingActions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approve or reject a pending action
router.put(
  "/:id",
  authMiddleware,
  checkPermission("SuperAdmin"),
  async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { status, data } = req.body;

      if (!status || !["APPROVED", "REJECTED"].includes(status)) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid status provided" });
      }

      const pendingAction = await PendingAction.findByPk(req.params.id, {
        transaction: t,
      });

      if (!pendingAction) {
        await t.rollback();
        return res.status(404).json({ message: "Pending action not found" });
      }

      if (pendingAction.status !== "PENDING") {
        await t.rollback();
        return res.status(400).json({ message: "Action is no longer pending" });
      }

     

      const parsedData = pendingAction.data; // No need to parse, it's already an object


      if (status === "APPROVED") {
        const Model = getElectoralPositionModel(
          pendingAction.entityType,
          parsedData
        );
        if (!Model) {
          throw new Error(
            `Invalid entity type or data: ${pendingAction.entityType}`
          );
        }

        let result;
        switch (pendingAction.actionType) {
          case "CREATE":
     
            result = await handleCreate(Model, parsedData, req.user.id, t);
  
            await AuditTrail.create(
              {
                actionType: "CREATE",
                entityType: Model.name,
                entityId: result.id,
                data: JSON.stringify(result.toJSON()),
                actionBy: req.user.id,
                status: "APPROVED",
              },
              { transaction: t }
            );
            break;
          case "UPDATE":
           
            result = await handleUpdate(
              Model,
              pendingAction.entityId,
              parsedData,
              req.user.id,
              t
            );
          
            break;
          case "DELETE":
          
            result = await handleDelete(
              Model,
              pendingAction.entityId,
              req.user.id,
              t
            );
           
            break;
          default:
            throw new Error(`Invalid action type: ${pendingAction.actionType}`);
        }
      }

      await pendingAction.update(
        { status, approvedBy: req.user.id },
        { transaction: t }
      );

      await t.commit();
      res.json({ message: "Pending action processed successfully" });
    } catch (error) {
      await t.rollback();
      console.error("Error processing pending action:", error);
      res.status(500).json({
        message: "An error occurred while processing the pending action",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

module.exports = router;

async function handleCreate(Model, data, userId, transaction) {
  // Handle different entity types
  if (
    Model === District ||
    Model === Region ||
    Model === Subregion ||
    Model === Constituency ||
    Model === Municipality ||
    Model === Subcounty ||
    Model === Parish ||
    Model === Village ||
    Model === Division ||
    Model === Ward ||
    Model === Cell
  ) {
    // Create administrative unit
    const result = await Model.create(
      {
        ...data,
        status: "approved",
        createdBy: userId,
      },
      { transaction }
    );
    return result;
  }

  // Handle candidate creation (existing logic)
  const { ninNumber, firstName, lastName, phoneNumber, ...otherData } = data;

  const isOppositionCandidate =
    Model === NationalOppositionCandidate ||
    Model === DistrictOppositionCandidate ||
    Model === ConstituencyMunicipalityOppositionCandidate ||
    Model === SubcountiesDivisionsOppositionCandidate ||
    Model === ParishesWardsOppositionCandidate ||
    Model === VillageCellOppositionCandidate;

  const candidateModel = isOppositionCandidate
    ? OppositionCandidate
    : Candidate;
  const candidate = await candidateModel.create(
    {
      ninNumber,
      firstName,
      lastName,
      phoneNumber,
      electionType: isOppositionCandidate ? "opposition" : "national",
    },
    { transaction }
  );

  const candidateIdField = isOppositionCandidate
    ? "oppositionCandidateId"
    : "candidateId";
  const result = await Model.create(
    {
      ...otherData,
      [candidateIdField]: candidate.id,
      status: "approved",
      createdBy: userId,
    },
    { transaction }
  );

  return result;
}

async function handleUpdate(Model, entityId, data, userId, transaction) {

  const [updatedRowsCount, updatedEntities] = await Model.update(
    {
      ...data,
      updatedBy: userId,
    },
    {
      where: { id: entityId },
      returning: true,
      transaction,
    }
  );
  if (updatedRowsCount === 0) {
    throw new Error(`${Model.name} with id ${entityId} not found`);
  }
  return updatedEntities[0];
}

async function handleDelete(Model, entityId, userId, transaction) {
 
  const deletedRowsCount = await Model.destroy({
    where: { id: entityId },
    transaction,
  });
  if (deletedRowsCount === 0) {
    throw new Error(`${Model.name} with id ${entityId} not found`);
  }
  return { id: entityId };
}
