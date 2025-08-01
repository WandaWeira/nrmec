const express = require("express");
const router = express.Router();
const {
  Region,
  Subregion,
  ConstituencyMunicipality,
  SubcountyDivision,
  ParishWard,
  VillageCell,
  District,
  Candidate,
  CandidateParticipation,
  Payment,
  Vote,
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");
const { sequelize } = require("../models");
const { Op } = require("sequelize");

router.get(
  "/administrative-units",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const stats = {
        regions: await Region.count(),
        subregions: await Subregion.count(),
        constituenciesMunicipalities: await ConstituencyMunicipality.count(),
        subcountiesDivisions: await SubcountyDivision.count(),
        parishesWards: await ParishWard.count(),
        villagesCells: await VillageCell.count(),
        districts: await District.count(),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/dashboard", async (req, res) => {
  try {
    // First, let's check if we can get basic counts
    const districtsCount = await District.count();

    // Get districts per region with simpler query first
    const districtsPerRegion = await Region.findAll({
      include: [
        {
          model: Subregion,
          as: "subregions",
          include: [
            {
              model: District,
              as: "districts",
            },
          ],
        },
      ],
      raw: false,
    });

    // Transform the data
    const formattedDistrictsPerRegion = districtsPerRegion.map((region) => ({
      name: region.name,
      districtCount: region.subregions.reduce(
        (acc, subregion) => acc + subregion.districts.length,
        0
      ),
    }));

    // Get counts for administrative units
    const adminUnitsDistribution = {
      Districts: await District.count(),
      Constituencies: await ConstituencyMunicipality.count(),
      Subcounties: await SubcountyDivision.count(),
      Parishes: await ParishWard.count(),
      Villages: await VillageCell.count(),
    };

    // Get subregions with all their nested data
    const subregionsData = await Subregion.findAll({
      include: [
        {
          model: District,
          as: "districts",
          include: [
            {
              model: ConstituencyMunicipality,
              as: "constituenciesMunicipalities",
              include: [
                {
                  model: SubcountyDivision,
                  as: "subcountiesDivisions",
                  include: [
                    {
                      model: ParishWard,
                      as: "parishesWards",
                      include: [
                        {
                          model: VillageCell,
                          as: "villagesCells",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Transform the data to match the chart format
    const statsPerSubregion = subregionsData.map((subregion) => ({
      subregionName: subregion.name,
      districtCount: subregion.districts.length,
      constituencyCount: subregion.districts.reduce(
        (acc, district) => acc + district.constituenciesMunicipalities.length,
        0
      ),
      subcountyCount: subregion.districts.reduce(
        (acc, district) =>
          acc +
          district.constituenciesMunicipalities.reduce(
            (acc2, constituency) =>
              acc2 + constituency.subcountiesDivisions.length,
            0
          ),
        0
      ),
      parishCount: subregion.districts.reduce(
        (acc, district) =>
          acc +
          district.constituenciesMunicipalities.reduce(
            (acc2, constituency) =>
              acc2 +
              constituency.subcountiesDivisions.reduce(
                (acc3, subcounty) => acc3 + subcounty.parishesWards.length,
                0
              ),
            0
          ),
        0
      ),
      villageCount: subregion.districts.reduce(
        (acc, district) =>
          acc +
          district.constituenciesMunicipalities.reduce(
            (acc2, constituency) =>
              acc2 +
              constituency.subcountiesDivisions.reduce(
                (acc3, subcounty) =>
                  acc3 +
                  subcounty.parishesWards.reduce(
                    (acc4, parish) => acc4 + parish.villagesCells.length,
                    0
                  ),
                0
              ),
            0
          ),
        0
      ),
    }));

    res.json({
      districtsPerRegion: formattedDistrictsPerRegion,
      adminUnitsDistribution,
      statsPerSubregion, // This matches the chart data structure
    });
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
});

// Add candidate statistics endpoint
router.get("/candidates", async (req, res) => {
  try {
    // Total candidates count
    const totalCandidates = await Candidate.count();

    // Candidates by election type
    const candidatesByElectionType = await Candidate.findAll({
      attributes: [
        "electionType",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["electionType"],
      raw: true,
    });

    // Candidates by gender
    const candidatesByGender = await Candidate.findAll({
      attributes: [
        "gender",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["gender"],
      raw: true,
    });

    // Total candidate participations
    const totalParticipations = await CandidateParticipation.count();

    // Participations by election type
    const participationsByElectionType = await CandidateParticipation.findAll({
      attributes: [
        "electionType",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["electionType"],
      raw: true,
    });

    // Participations by level
    const participationsByLevel = await CandidateParticipation.findAll({
      attributes: [
        "level",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["level"],
      raw: true,
    });

    // Participations by status
    const participationsByStatus = await CandidateParticipation.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Nominated candidates count
    const nominatedCandidates = await CandidateParticipation.count({
      where: { isNominated: true },
    });

    // Qualified candidates count
    const qualifiedCandidates = await CandidateParticipation.count({
      where: { isQualified: true },
    });

    // Payment statistics
    const totalPayments = await Payment.count();
    const completedPayments = await Payment.count({
      where: { status: "completed" },
    });
    const totalPaymentAmount = await Payment.sum("amount", {
      where: { status: "completed" },
    });

    // Candidates with payments
    const candidatesWithPayments = await Payment.findAll({
      attributes: [
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("candidateId"))
          ),
          "count",
        ],
      ],
      where: { status: "completed" },
      raw: true,
    });

    // Vote statistics
    const totalVotes = (await Vote.sum("votes")) || 0;
    const candidatesWithVotes = await Vote.findAll({
      attributes: [
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("candidateParticipationId"))
          ),
          "count",
        ],
      ],
      raw: true,
    });

    // Candidates by subregion
    const candidatesBySubregion = await CandidateParticipation.findAll({
      attributes: [
        [sequelize.col("subregion.name"), "subregionName"],
        [
          sequelize.fn("COUNT", sequelize.col("CandidateParticipation.id")),
          "count",
        ],
      ],
      include: [
        {
          model: Subregion,
          as: "subregion",
          attributes: [],
        },
      ],
      where: {
        subregionId: { [Op.not]: null },
      },
      group: ["subregion.id", "subregion.name"],
      raw: true,
    });

    // Candidates by district
    const candidatesByDistrict = await CandidateParticipation.findAll({
      attributes: [
        [sequelize.col("district.name"), "districtName"],
        [
          sequelize.fn("COUNT", sequelize.col("CandidateParticipation.id")),
          "count",
        ],
      ],
      include: [
        {
          model: District,
          as: "district",
          attributes: [],
        },
      ],
      where: {
        districtId: { [Op.not]: null },
      },
      group: ["district.id", "district.name"],
      raw: true,
      limit: 20, // Limit to top 20 districts
    });

    res.json({
      totalCandidates,
      totalParticipations,
      nominatedCandidates,
      qualifiedCandidates,
      candidatesByElectionType: candidatesByElectionType.map((item) => ({
        name: item.electionType || "Unknown",
        value: parseInt(item.count),
      })),
      candidatesByGender: candidatesByGender.map((item) => ({
        name: item.gender || "Unknown",
        value: parseInt(item.count),
      })),
      participationsByElectionType: participationsByElectionType.map(
        (item) => ({
          name: item.electionType || "Unknown",
          value: parseInt(item.count),
        })
      ),
      participationsByLevel: participationsByLevel.map((item) => ({
        name: item.level || "Unknown",
        value: parseInt(item.count),
      })),
      participationsByStatus: participationsByStatus.map((item) => ({
        name: item.status || "Unknown",
        value: parseInt(item.count),
      })),
      paymentStats: {
        totalPayments,
        completedPayments,
        totalAmount: parseFloat(totalPaymentAmount) || 0,
        candidatesWithPayments: parseInt(candidatesWithPayments[0]?.count) || 0,
      },
      voteStats: {
        totalVotes,
        candidatesWithVotes: parseInt(candidatesWithVotes[0]?.count) || 0,
      },
      candidatesBySubregion: candidatesBySubregion.map((item) => ({
        name: item.subregionName,
        value: parseInt(item.count),
      })),
      candidatesByDistrict: candidatesByDistrict.map((item) => ({
        name: item.districtName,
        value: parseInt(item.count),
      })),
    });
  } catch (error) {
    console.error("Error fetching candidate statistics:", error);
    res.status(500).json({
      message: "Error fetching candidate statistics",
      error: error.message,
    });
  }
});

// Add detailed candidate report endpoint with filtering
router.get("/candidates/report", async (req, res) => {
  try {
    const {
      electionType,
      level,
      status,
      gender,
      regionId,
      subregionId,
      districtId,
      constituencyId,
      subcountyId,
      parishId,
      villageId,
      isNominated,
      isQualified,
      hasPayment,
      page = 1,
      limit = 20,
    } = req.query;

    // Build the where clause based on filters
    const where = {};

    // Build participation where clause
    const participationWhere = {};

    if (electionType) participationWhere.electionType = electionType;
    if (level) participationWhere.level = level;
    if (status) participationWhere.status = status;
    if (isNominated === "true") participationWhere.isNominated = true;
    if (isQualified === "true") participationWhere.isQualified = true;

    // Administrative unit filters for participations
    if (regionId) participationWhere.regionId = regionId;
    if (subregionId) participationWhere.subregionId = subregionId;
    if (districtId) participationWhere.districtId = districtId;
    if (constituencyId)
      participationWhere.constituencyMunicipalityId = constituencyId;
    if (subcountyId) participationWhere.subcountyDivisionId = subcountyId;
    if (parishId) participationWhere.parishWardId = parishId;
    if (villageId) participationWhere.villageCellId = villageId;

    // Candidate filters
    if (gender) where.gender = gender;

    // Payment filter requires a join
    const paymentInclude =
      hasPayment === "true"
        ? [
            {
              model: Payment,
              as: "payments",
              required: true,
              where: { status: "completed" },
            },
          ]
        : undefined;

    // Query options
    const options = {
      include: [
        {
          model: CandidateParticipation,
          as: "participations",
          where:
            Object.keys(participationWhere).length > 0
              ? participationWhere
              : undefined,
          include: [
            { model: Region, as: "region", attributes: ["id", "name"] },
            { model: Subregion, as: "subregion", attributes: ["id", "name"] },
            { model: District, as: "district", attributes: ["id", "name"] },
            {
              model: ConstituencyMunicipality,
              as: "constituencyMunicipality",
              attributes: ["id", "name", "type"],
            },
            {
              model: SubcountyDivision,
              as: "subcountyDivision",
              attributes: ["id", "name", "type"],
            },
            {
              model: ParishWard,
              as: "parishWard",
              attributes: ["id", "name", "type"],
            },
            {
              model: VillageCell,
              as: "villageCell",
              attributes: ["id", "name", "type"],
            },
          ],
          required: true,
        },
        ...(paymentInclude ? paymentInclude : []),
      ],
      where,
      distinct: true,
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    };

    // Get paginated candidates
    const { count, rows: candidates } = await Candidate.findAndCountAll(
      options
    );

    // Transform data for reporting
    const formattedCandidates = candidates.map((candidate) => {
      const candidateJson = candidate.toJSON();
      const participations = candidateJson.participations || [];

      // Format for each participation
      const formattedParticipations = participations.map((p) => ({
        id: p.id,
        electionType: p.electionType,
        level: p.level,
        status: p.status,
        isNominated: p.isNominated,
        isQualified: p.isQualified,
        position: p.position,
        nominationDate: p.nominationDate,
        region: p.region?.name,
        subregion: p.subregion?.name,
        district: p.district?.name,
        constituency: p.constituencyMunicipality?.name,
        constituencyType: p.constituencyMunicipality?.type,
        subcounty: p.subcountyDivision?.name,
        subcountyType: p.subcountyDivision?.type,
        parish: p.parishWard?.name,
        parishType: p.parishWard?.type,
        village: p.villageCell?.name,
        villageType: p.villageCell?.type,
      }));

      return {
        id: candidate.id,
        fullName: `${candidate.firstName} ${candidate.lastName}`,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        gender: candidate.gender,
        phoneNumber: candidate.phoneNumber,
        ninNumber: candidate.ninNumber,
        dateOfBirth: candidate.dateOfBirth,
        hasPaidFees:
          candidateJson.payments && candidateJson.payments.length > 0,
        participations: formattedParticipations,
      };
    });

    // Get unique options for filter dropdowns
    const electionTypes = await CandidateParticipation.findAll({
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("electionType")),
          "electionType",
        ],
      ],
      raw: true,
    }).then((types) => types.map((t) => t.electionType));

    const levels = await CandidateParticipation.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("level")), "level"]],
      raw: true,
    }).then((levels) => levels.map((l) => l.level));

    const statuses = await CandidateParticipation.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("status")), "status"],
      ],
      raw: true,
    }).then((statuses) => statuses.map((s) => s.status));

    const positions = await CandidateParticipation.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("position")), "position"],
      ],
      raw: true,
    }).then((positions) => positions.map((p) => p.position));

    res.json({
      candidates: formattedCandidates,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      filters: {
        electionTypes,
        levels,
        statuses,
        positions,
      },
    });
  } catch (error) {
    console.error("Error fetching candidate report:", error);
    res.status(500).json({
      message: "Error fetching candidate report",
      error: error.message,
    });
  }
});

module.exports = router;
