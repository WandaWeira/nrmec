const express = require("express");
const router = express.Router();
const { Fee, FeeHistory, Payment } = require("../models");
const {
  Candidate,
  NationalCandidate,
  DistrictCandidate,
  ConstituencyMunicipalityCandidate,
  SubcountiesDivisionsCandidate,
  ParishesWardsCandidate,
  VillageCellCandidate,
} = require("../models");

router.get("/candidate-fee/:ninNumber", async (req, res) => {
  try {
    const { ninNumber } = req.params;

    // Find the base candidate
    const baseCandidate = await Candidate.findOne({
      where: { ninNumber },
    });

    if (!baseCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check each candidate type table
    const candidateDetails = await Promise.all([
      NationalCandidate.findOne({ where: { candidateId: baseCandidate.id } }),
      DistrictCandidate.findOne({ where: { candidateId: baseCandidate.id } }),
      ConstituencyMunicipalityCandidate.findOne({
        where: { candidateId: baseCandidate.id },
      }),
      SubcountiesDivisionsCandidate.findOne({
        where: { candidateId: baseCandidate.id },
      }),
      ParishesWardsCandidate.findOne({
        where: { candidateId: baseCandidate.id },
      }),
      VillageCellCandidate.findOne({
        where: { candidateId: baseCandidate.id },
      }),
    ]);

    const candidateDetail = candidateDetails.find((detail) => detail !== null);

    if (!candidateDetail) {
      return res.status(404).json({ message: "Candidate details not found" });
    }

    // Prepare fee query based on candidate type
    let feeQuery = {
      where: {
        isActive: true,
      },
    };

    if (candidateDetail instanceof NationalCandidate) {
      feeQuery.where.electionType = "nationalElectionType";
      feeQuery.where.subType = candidateDetail.nationalElectionType;
      if (candidateDetail.category) {
        feeQuery.where.category = candidateDetail.category;
      }
    } else if (candidateDetail instanceof DistrictCandidate) {
      feeQuery.where.electionType = "districtElectionType";
      feeQuery.where.subType = candidateDetail.districtElectionType;
      if (candidateDetail.districtElectionType === "partyStructure") {
        feeQuery.where.category = candidateDetail.category?.toLowerCase();
        feeQuery.where.position = candidateDetail.position?.toLowerCase();
      } else {
        feeQuery.where.position = candidateDetail.position?.toLowerCase();
      }
    }
    // Similar logic for other candidate types...
    else if (candidateDetail instanceof ConstituencyMunicipalityCandidate) {
      feeQuery.where.electionType = "constituencyMunicipalityElectionType";
      feeQuery.where.subType =
        candidateDetail.constituencyMunicipalityElectionType;
      if (
        candidateDetail.constituencyMunicipalityElectionType ===
        "partyStructure"
      ) {
        feeQuery.where.category = candidateDetail.category?.toLowerCase();
        feeQuery.where.position = candidateDetail.position?.toLowerCase();
      } else if (
        ["municipalityCouncillors", "municipalitySIGCouncillors"].includes(
          candidateDetail.constituencyMunicipalityElectionType
        )
      ) {
        feeQuery.where.position = candidateDetail.councilorType;
      }
    }
    // Add similar blocks for other candidate types...

    // Find the fee
    const feeRecord = await Fee.findOne(feeQuery);

    if (!feeRecord) {
      return res
        .status(404)
        .json({ message: "Fee structure not found for this candidate type" });
    }

    return res.json({
      candidateType: candidateDetail.constructor.name,
      fee: feeRecord.amount,
      feeDetails: feeRecord,
      candidateDetails: {
        ninNumber: baseCandidate.ninNumber,
        firstName: baseCandidate.firstName,
        lastName: baseCandidate.lastName,
        ...candidateDetail.dataValues,
      },
    });
  } catch (error) {
    console.error("Error calculating candidate fee:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/calculate", async (req, res) => {
  try {
    const { candidateId } = req.query;

    // Find candidate details
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Find matching fee
    const fee = await Fee.findOne({
      where: {
        electionType: candidate.electionType,
        category: candidate.category,
        position: candidate.position,
        isActive: true,
      },
    });

    if (!fee) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    res.json({ amount: fee.amount });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error calculating fee", error: error.message });
  }
});

// GET /fees - Get all fees
router.get("/", async (req, res) => {
  try {
    const fees = await Fee.findAll({
      include: [
        {
          model: FeeHistory,
          as: "feeHistory",
          attributes: ["id", "amount", "updatedBy", "createdAt"],
        },
      ],
      order: [
        ["electionType", "ASC"],
        ["level", "ASC"],
        ["category", "ASC"],
        ["subcategory", "ASC"],
        ["nestedCategory", "ASC"],
        ["position", "ASC"],
      ],
    });
    res.json(fees);
  } catch (error) {
    console.error("Error fetching fees:", error);
    res
      .status(500)
      .json({ message: "Error fetching fees", error: error.message });
  }
});

// POST /fees - Create new fee
router.post("/", async (req, res) => { // Changed from "/fees" to "/"
  try {
    const { 
      electionType, 
      level, // This corresponds to subType in the frontend's DTO
      category, 
      subcategory,
      nestedCategory,
      position, 
      positionPath,
      amount 
    } = req.body;

    // Validate required fields
    // The frontend will now send 'subType' which maps to 'level' here.
    // 'electionType' will be the specific one like 'nationalElectionType'
    if (!electionType || !amount || !positionPath) { // level (subType) might not always be present if path is short
      return res.status(400).json({
        message: "Election type, amount, and positionPath are required",
      });
    }

    // Check for duplicate fee based on position path
    // With positionPath being the primary identifier, this check is simplified.
    const existingFee = await Fee.findOne({ 
      where: { 
        positionPath,
        isActive: true 
      } 
    });

    if (existingFee) {
      return res.status(400).json({
        message: "A fee with this position path already exists",
      });
    }

    // Create new fee
    // The 'level' field in the Fee model might need to be populated from positionPath's second segment.
    // Or, ensure that 'subType' from the client is correctly passed as 'level'.
    // For now, assuming client sends 'level' (as 'subType' in its DTO) if applicable.
    const newFee = await Fee.create({
      electionType, // e.g. "nationalElectionType"
      level, // This is the 'subType' from baseApi.ts CreateFeeDto
      category,
      subcategory,
      nestedCategory,
      position,
      positionPath, // e.g. "INTERNAL_PARTY/NATIONAL_LEVEL_POSITIONS/PRESIDENT"
      amount,
      isActive: true,
    });

    // Create fee history entry
    await FeeHistory.create({
      feeId: newFee.id,
      amount,
      updatedBy: req.user?.id || "system", // Assuming you have user info in request
      date: new Date(),
    });

    res.status(201).json(newFee);
  } catch (error) {
    console.error("Error creating fee:", error);
    res
      .status(500)
      .json({ message: "Error creating fee", error: error.message });
  }
});

// GET /fees/election-type/:electionType - Get fees by election type
router.get("/election-type/:electionType", async (req, res) => {
  try {
    const { electionType } = req.params;

    const fees = await Fee.findAll({
      where: {
        electionType,
        isActive: true,
      },
      include: [
        {
          model: FeeHistory,
          as: "feeHistory",
          attributes: ["id", "amount", "updatedBy", "createdAt"],
        },
      ],
      order: [
        ["subType", "ASC"],
        ["category", "ASC"],
        ["position", "ASC"],
      ],
    });

    if (!fees.length) {
      return res.status(404).json({
        message: `No fees found for election type: ${electionType}`,
      });
    }

    res.json(fees);
  } catch (error) {
    console.error("Error fetching fees by election type:", error);
    res.status(500).json({
      message: "Error fetching fees by election type",
      error: error.message,
    });
  }
});

// GET /fees/sub-type/:subType - Get fees by sub type
router.get("/sub-type/:subType", async (req, res) => {
  try {
    const { subType } = req.params;

    const fees = await Fee.findAll({
      where: {
        subType,
        isActive: true,
      },
      include: [
        {
          model: FeeHistory,
          as: "feeHistory",
          attributes: ["id", "amount", "updatedBy", "createdAt"],
        },
      ],
      order: [
        ["electionType", "ASC"],
        ["category", "ASC"],
        ["position", "ASC"],
      ],
    });

    if (!fees.length) {
      return res.status(404).json({
        message: `No fees found for sub type: ${subType}`,
      });
    }

    res.json(fees);
  } catch (error) {
    console.error("Error fetching fees by sub type:", error);
    res.status(500).json({
      message: "Error fetching fees by sub type",
      error: error.message,
    });
  }
});

// PUT /fees/:id - Update fee
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, isActive } = req.body;

    const fee = await Fee.findByPk(id);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    // Update fee
    await fee.update({
      amount: amount !== undefined ? amount : fee.amount,
      isActive: isActive !== undefined ? isActive : fee.isActive,
    });

    // Create fee history entry if amount changed
    if (amount !== undefined && amount !== fee.amount) {
      await FeeHistory.create({
        feeId: fee.id,
        amount,
        updatedBy: req.user?.id || "system", // Assuming you have user info in request
        date: new Date(),
      });
    }

    // Fetch updated fee with history
    const updatedFee = await Fee.findByPk(id, {
      include: [
        {
          model: FeeHistory,
          as: "feeHistory",
          attributes: ["id", "amount", "updatedBy", "createdAt"],
        },
      ],
    });

    res.json(updatedFee);
  } catch (error) {
    console.error("Error updating fee:", error);
    res
      .status(500)
      .json({ message: "Error updating fee", error: error.message });
  }
});

// GET /fees/:feeId/history - Get fee history
router.get("/:feeId/history", async (req, res) => {
  try {
    const { feeId } = req.params;

    const history = await FeeHistory.findAll({
      where: { feeId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Fee,
          attributes: ["electionType", "subType", "category", "position"],
        },
      ],
    });

    if (!history.length) {
      return res.status(404).json({
        message: `No history found for fee ID: ${feeId}`,
      });
    }

    res.json(history);
  } catch (error) {
    console.error("Error fetching fee history:", error);
    res.status(500).json({
      message: "Error fetching fee history",
      error: error.message,
    });
  }
});

router.post("/payments", async (req, res) => {
  try {
    const {
      candidateId,
      candidateParticipationId,
      amount,
      paymentMethod,
      transactionCode,
      electionType,
      subType,
      category,
      subcategory,
      nestedCategory,
      position,
      positionPath,
      receiptNumber,
      status,
    } = req.body;

    // Validate required fields
    if (
      !candidateId ||
      !amount ||
      !paymentMethod ||
      !electionType ||
      !subType ||
      !receiptNumber
    ) {
      return res.status(400).json({
        message:
          "Missing required fields. Please provide all necessary payment details.",
      });
    }

    // Verify candidate exists
    const candidate = await Candidate.findOne({where: {ninNumber: candidateId}});
    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    // Check for duplicate receipt number
    const existingPayment = await Payment.findOne({
      where: { receiptNumber },
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Receipt number already exists",
      });
    }

    // Create payment record
    const payment = await Payment.create(
      {
        candidateId,
        candidateParticipationId, // Add the candidateParticipationId
        amount,
        paymentMethod,
        transactionCode,
        electionType,
        subType,
        category: category || null,
        subcategory: subcategory || null,
        nestedCategory: nestedCategory || null,
        position: position || null,
        positionPath: positionPath || null, // Add the position path
        receiptNumber,
        status,
        paymentDate: new Date(),
        processedBy: req.user?.id || "system", // Assuming you have user info in request
      }
    );

    // Update candidate payment status if needed
    await candidate.update(
      {
        paymentStatus: "completed",
        paymentDate: new Date(),
      }
    );

 

    // Fetch the complete payment record with candidate details
    const completePayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Candidate,
          attributes: ["firstName", "lastName", "ninNumber"],
        },
      ],
    });

    res.status(201).json({
      message: "Payment processed successfully",
      payment: completePayment,
    });
  } catch (error) {
   
    console.error("Error processing payment:", error);
    res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
});

// Add a route to get payment history for a candidate
router.get("/payments/candidate/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const payments = await Payment.findAll({
      where: { candidateId },
      include: [
        {
          model: Candidate,
          attributes: ["firstName", "lastName", "ninNumber"],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching candidate payments:", error);
    res.status(500).json({
      message: "Error fetching payment history",
      error: error.message,
    });
  }
});

// Add a route to get payment details by receipt number
router.get("/payments/receipt/:receiptNumber", async (req, res) => {
  try {
    const { receiptNumber } = req.params;

    const payment = await Payment.findOne({
      where: { receiptNumber },
      include: [
        {
          model: Candidate,
          attributes: ["firstName", "lastName", "ninNumber"],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      message: "Error fetching payment details",
      error: error.message,
    });
  }
});

router.get('/payments', async (req, res) => {
  try {
    // Fetch all payments without including candidate relationship
    const payments = await Payment.findAll({
      order: [['createdAt', 'DESC']],
      raw: true
    });

    // Fetch all candidates separately
    const candidates = await Candidate.findAll({
      attributes: ['firstName', 'lastName', 'ninNumber'],
      raw: true
    });
console.log("candidates-------->",candidates)
    // Create a map of NIN numbers to candidate details for faster lookup
    const candidateMap = candidates.reduce((acc, candidate) => {
      acc[candidate.ninNumber] = {
        firstName: candidate.firstName,
        lastName: candidate.lastName
      };
      return acc;
    }, {});

    // Match payments with candidates using NIN number
    const formattedPayments = payments.map(payment => {
      const candidate = candidateMap[payment.candidateId];
      return {
        ...payment,
        candidateName: candidate 
          ? `${candidate.firstName} ${candidate.lastName}`
          : 'Unknown Candidate',
        amount: parseFloat(payment.amount)
      };
    });

    res.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      message: 'Error fetching payments',
      error: error.message
    });
  }
});
module.exports = router;
