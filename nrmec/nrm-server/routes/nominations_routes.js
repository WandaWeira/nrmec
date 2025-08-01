const express = require("express");
const router = express.Router();
const { Sequelize, Op } = require("sequelize");
const {
  CandidateParticipation,
  Candidate,
  Fee,
  Payment,
  Region,
  Subregion,
  District,
  ConstituencyMunicipality,
  SubcountyDivision,
  ParishWard,
  VillageCell,
  Vote,
  User,
} = require("../models");
const { authMiddleware } = require("../middleware/middleware");

// Test endpoint to debug parameters (temporarily without auth)
router.get("/test-params", async (req, res) => {
  console.log(
    "Test endpoint - Full request query:",
    JSON.stringify(req.query, null, 2)
  );
  res.json({
    message: "Test endpoint",
    receivedParams: req.query,
  });
});

// Get all candidates eligible for nomination
router.get("/candidates", authMiddleware, async (req, res) => {
  console.log("Fetching candidates for nomination...");
  console.log("Full request query:", JSON.stringify(req.query, null, 2));
  try {
    const {
      electionType,
      level,
      regionId,
      subregionId,
      districtId,
      constituencyMunicipalityId,
      subcountyDivisionId,
      parishWardId,
      villageCellId,
      positionPath,
      feesPaid,
      nominated,
    } = req.query;

    console.log("Query parameters:", req.query);
    // Build the filter conditions
    const whereConditions = {
      electionType,
      level,
    };

    if (positionPath) {
      whereConditions.positionPath = positionPath;
    }

    if (regionId) whereConditions.regionId = regionId;
    if (subregionId) whereConditions.subregionId = subregionId;
    if (districtId) whereConditions.districtId = districtId;
    if (constituencyMunicipalityId)
      whereConditions.constituencyMunicipalityId = constituencyMunicipalityId;
    if (subcountyDivisionId)
      whereConditions.subcountyDivisionId = subcountyDivisionId;
    if (parishWardId) whereConditions.parishWardId = parishWardId;
    if (villageCellId) whereConditions.villageCellId = villageCellId;

    // If nominated filter is provided
    if (nominated !== undefined) {
      whereConditions.isNominated =
        nominated === "true" || nominated === "nominated";
    }

    // Get all candidates with their participation information
    const candidates = await CandidateParticipation.findAll({
      where: whereConditions,
      include: [
        { model: Candidate, as: "candidate" },
        { model: Region, as: "region" },
        { model: Subregion, as: "subregion" },
        { model: District, as: "district" },
        { model: ConstituencyMunicipality, as: "constituencyMunicipality" },
        { model: SubcountyDivision, as: "subcountyDivision" },
        { model: ParishWard, as: "parishWard" },
        { model: VillageCell, as: "villageCell" },
        {
          model: Vote,
          as: "votes",
          include: [
            {
              model: User,
              as: "recorder",
              attributes: ["id", "firstName", "lastName"],
            },
            {
              model: User,
              as: "updater",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
    });

    // Debug: Log votes data for first candidate
    if (candidates.length > 0) {
      console.log("First candidate votes:", candidates[0].votes);
      console.log(
        "First candidate data:",
        JSON.stringify(candidates[0], null, 2)
      );
    }

    // If feesPaid filter is provided, we'll filter in memory after getting payments
    if (feesPaid !== undefined) {
      // Get all payments for these candidates' participations
      const participationIds = candidates.map((c) => c.id);
      console.log(
        "Looking for payments for participation IDs:",
        participationIds
      );
      const payments = await Payment.findAll({
        where: {
          [Op.or]: [
            // Check if payment links directly to participation ID
            { candidateParticipationId: { [Op.in]: participationIds } },
            // Also check the old way (by candidate ID and position path)
            {
              candidateId: { [Op.in]: candidates.map((c) => c.candidateId) },
              status: "completed",
            },
          ],
        },
      });

      console.log("Found payments:", payments.length);

      // Create maps for both methods of payment tracking
      const participationPaymentsMap = {};
      const candidatePositionPaymentsMap = {};

      payments.forEach((payment) => {
        // Map by participation ID (new way)
        if (payment.candidateParticipationId) {
          participationPaymentsMap[payment.candidateParticipationId] = true;
        }

        // Map by candidate ID and position path (old way)
        if (payment.candidateId && payment.positionPath) {
          const key = `${payment.candidateId}-${payment.positionPath}`;
          candidatePositionPaymentsMap[key] = true;
        }
      });

      // Filter candidates based on fee payment status
      const filteredCandidates = candidates
        .map((candidate) => {
          // Check payment by participation ID first (new way)
          let hasPaid = participationPaymentsMap[candidate.id] || false;

          // If not found, fall back to the old way (candidate ID + position path)
          if (!hasPaid && candidate.candidateId && candidate.positionPath) {
            const key = `${candidate.candidateId}-${candidate.positionPath}`;
            hasPaid = candidatePositionPaymentsMap[key] || false;
          }

          // Add the payment status to the candidate object for the frontend
          return {
            ...candidate.toJSON(),
            feesPaid: hasPaid,
          };
        })
        .filter((candidate) => {
          return feesPaid === "true" || feesPaid === "paid"
            ? candidate.feesPaid
            : !candidate.feesPaid;
        });
      return res.json(filteredCandidates);
    }

    // If no feesPaid filter applied, we still need to add payment status to each candidate
    const participationIds = candidates.map((c) => c.id);
    const candidateIds = candidates.map((c) => c.candidateId);
    const payments = await Payment.findAll({
      where: {
        [Op.or]: [
          { candidateParticipationId: { [Op.in]: participationIds } },
          {
            candidateId: { [Op.in]: candidateIds },
            status: "completed",
          },
        ],
      },
    });

    // Create maps for both methods of payment tracking
    const participationPaymentsMap = {};
    const candidatePositionPaymentsMap = {};

    payments.forEach((payment) => {
      if (payment.candidateParticipationId) {
        participationPaymentsMap[payment.candidateParticipationId] = true;
      }

      if (payment.candidateId && payment.positionPath) {
        const key = `${payment.candidateId}-${payment.positionPath}`;
        candidatePositionPaymentsMap[key] = true;
      }
    });

    // Add payment status to candidates
    const candidatesWithPaymentStatus = candidates.map((candidate) => {
      let hasPaid = participationPaymentsMap[candidate.id] || false;

      if (!hasPaid && candidate.candidateId && candidate.positionPath) {
        const key = `${candidate.candidateId}-${candidate.positionPath}`;
        hasPaid = candidatePositionPaymentsMap[key] || false;
      }

      return {
        ...candidate.toJSON(),
        feesPaid: hasPaid,
      };
    });

    console.log(
      "Candidates fetched successfully:",
      candidatesWithPaymentStatus.length
    );

    res.json(candidatesWithPaymentStatus);
  } catch (error) {
    console.error("Error fetching candidates for nomination:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch candidates for nomination" });
  }
});

// Get all nominated candidates
router.get("/nominated", authMiddleware, async (req, res) => {
  try {
    const {
      electionType,
      level,
      regionId,
      subregionId,
      districtId,
      constituencyMunicipalityId,
      subcountyDivisionId,
      parishWardId,
      villageCellId,
      positionPath,
    } = req.query;

    // Build the filter conditions
    const whereConditions = {
      electionType,
      level,
      isNominated: true,
    };

    if (positionPath) {
      whereConditions.positionPath = positionPath;
    }

    if (regionId) whereConditions.regionId = regionId;
    if (subregionId) whereConditions.subregionId = subregionId;
    if (districtId) whereConditions.districtId = districtId;
    if (constituencyMunicipalityId)
      whereConditions.constituencyMunicipalityId = constituencyMunicipalityId;
    if (subcountyDivisionId)
      whereConditions.subcountyDivisionId = subcountyDivisionId;
    if (parishWardId) whereConditions.parishWardId = parishWardId;
    if (villageCellId) whereConditions.villageCellId = villageCellId;

    // Get all nominated candidates
    const candidates = await CandidateParticipation.findAll({
      where: whereConditions,
      include: [
        { model: Candidate, as: "candidate" },
        { model: Region, as: "region" },
        { model: Subregion, as: "subregion" },
        { model: District, as: "district" },
        { model: ConstituencyMunicipality, as: "constituencyMunicipality" },
        { model: SubcountyDivision, as: "subcountyDivision" },
        { model: ParishWard, as: "parishWard" },
        { model: VillageCell, as: "villageCell" },
        {
          model: Vote,
          as: "votes",
          include: [
            {
              model: User,
              as: "recorder",
              attributes: ["id", "firstName", "lastName"],
            },
            {
              model: User,
              as: "updater",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
    });

    // Debug: Log votes data for nominated candidates
    console.log("Nominated candidates count:", candidates.length);
    if (candidates.length > 0) {
      console.log("First nominated candidate votes:", candidates[0].votes);
      console.log("First nominated candidate ID:", candidates[0].id);
    }

    res.json(candidates);
  } catch (error) {
    console.error("Error fetching nominated candidates:", error);
    res.status(500).json({ error: "Failed to fetch nominated candidates" });
  }
});

// Nominate a candidate
router.post("/nominate", authMiddleware, async (req, res) => {
  try {
    const {
      candidateId,
      participationId,
      electionType,
      level,
      positionPath,
      notes,
      reasonForNomination,
    } = req.body;
    console.log("Nomination request:", req.body);

    // First check if this candidate has paid the required fees (check both methods)
    const payment = await Payment.findOne({
      where: {
        [Op.or]: [
          // Check by participation ID (new way)
          { candidateParticipationId: participationId, status: "completed" },
          // Check by candidate ID and position path (old way)
          { candidateId, positionPath, status: "completed" },
        ],
      },
    });

    // console.log('Checking payment for nomination:', {
    //   participationId, candidateId, positionPath,
    //   paymentFound: payment ? 'Yes' : 'No'
    // });

    if (!payment) {
      return res.status(400).json({
        error: "Candidate has not paid the required fees for this position",
      });
    } // Update the candidate participation record
    const updateResult = await CandidateParticipation.update(
      {
        isNominated: true,
        nominationNotes: notes,
        reasonForNomination,
        nominatedBy: req.user.id,
        nominatedAt: new Date(),
      },
      {
        where: { id: participationId },
        returning: true,
      }
    );
    console.log("Update result:", updateResult); // Handle different return formats from Sequelize update
    let rowsUpdated, updatedParticipation;

    if (Array.isArray(updateResult)) {
      // Check if second element is an array (PostgreSQL format)
      if (Array.isArray(updateResult[1])) {
        // PostgreSQL format: [rowsUpdated, [updatedRecords]]
        [rowsUpdated, [updatedParticipation]] = updateResult;
      } else {
        // Other array format: [affectedRows, affectedCount]
        rowsUpdated = updateResult[1] || updateResult[0];
        updatedParticipation = await CandidateParticipation.findByPk(
          participationId
        );
      }
    } else {
      // Non-array format: just the count
      rowsUpdated = updateResult;
      updatedParticipation = await CandidateParticipation.findByPk(
        participationId
      );
    }

    console.log("Update result processed:", {
      rowsUpdated,
      hasUpdatedRecord: !!updatedParticipation,
    });

    if (rowsUpdated === 0) {
      return res
        .status(404)
        .json({ error: "Candidate participation record not found" });
    }

    res.status(200).json({
      message: "Candidate nominated successfully",
      participation: updatedParticipation,
    });
  } catch (error) {
    console.error("Error nominating candidate:", error);
    res.status(500).json({ error: "Failed to nominate candidate" });
  }
});

// Remove a nomination
router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const { nominationId, electionType, level } = req.body; // Update the candidate participation record
    const updateResult = await CandidateParticipation.update(
      {
        isNominated: false,
        nominationNotes: null,
        reasonForNomination: null,
        nominatedBy: null,
        nominatedAt: null,
      },
      {
        where: {
          id: nominationId,
          electionType,
          level,
        },
        returning: true,
      }
    ); // Handle different Sequelize return formats
    let rowsUpdated, updatedParticipation;
    if (Array.isArray(updateResult)) {
      // Check if second element is an array (PostgreSQL format)
      if (Array.isArray(updateResult[1])) {
        // PostgreSQL format: [rowsUpdated, [updatedRecords]]
        [rowsUpdated, [updatedParticipation]] = updateResult;
      } else {
        // Other array format: [affectedRows, affectedCount]
        rowsUpdated = updateResult[1] || updateResult[0];
        updatedParticipation = await CandidateParticipation.findByPk(
          nominationId
        );
      }
    } else {
      rowsUpdated = updateResult;
      updatedParticipation = await CandidateParticipation.findByPk(
        nominationId
      );
    }

    if (rowsUpdated === 0) {
      return res.status(404).json({ error: "Nomination record not found" });
    }

    res.status(200).json({
      message: "Nomination removed successfully",
      participation: updatedParticipation,
    });
  } catch (error) {
    console.error("Error removing nomination:", error);
    res.status(500).json({ error: "Failed to remove nomination" });
  }
});

module.exports = router;
