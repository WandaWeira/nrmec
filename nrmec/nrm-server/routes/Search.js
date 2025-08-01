// nrm-server/routes/Search.js
const express = require("express");
const router = express.Router();
const { Op, Sequelize } = require("sequelize");
const {
  Region,
  Subregion,
  District,
  ConstituencyMunicipality,
  SubcountyDivision,
  ParishWard,
  VillageCell,
  PollingStation,
  Candidate,
  User,
  Payment,
} = require("../models");
const { authMiddleware } = require("../middleware/middleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    const searchResults = {};

    if (!query) {
      return res.json(searchResults);
    }

    // Helper function to create case-sensitive search condition
    const createSearchCondition = (columnName) => ({
      [columnName]: Sequelize.where(
        Sequelize.fn("BINARY", Sequelize.col(columnName)),
        { [Op.like]: `%${query}%` }
      ),
    });

    // Search in regions
    searchResults.regions = await Region.findAll({
      where: createSearchCondition("name"),
      limit: 5,
    });

    // Search in subregions
    searchResults.subregions = await Subregion.findAll({
      where: createSearchCondition("name"),
      limit: 5,
    });

    // Search in districts
    searchResults.districts = await District.findAll({
      where: createSearchCondition("name"),
      limit: 5,
    });

    // Search in constituencies
    searchResults.constituencies = await ConstituencyMunicipality.findAll({
      where: createSearchCondition("name"),
      limit: 5,
    });

    // Search in subcounties/divisions
    searchResults.subcounties = await SubcountyDivision.findAll({
      where: createSearchCondition("name"),
      limit: 5,
    });

    // Search in parishes/wards
    searchResults.parishes = await ParishWard.findAll({
      where: createSearchCondition("name"),
      limit: 5,
    });

    // Search in villages/cells
    searchResults.villages = await VillageCell.findAll({
      where: createSearchCondition("name"),
      limit: 5,
    });

    // Search in polling stations
    searchResults.pollingStations = await PollingStation.findAll({
      where: createSearchCondition("name"),
      limit: 5,
    });

    // Search in users
    searchResults.users = await User.findAll({
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn("BINARY", Sequelize.col("firstName")), {
            [Op.like]: `%${query}%`,
          }),
          Sequelize.where(Sequelize.fn("BINARY", Sequelize.col("lastName")), {
            [Op.like]: `%${query}%`,
          }),
          Sequelize.where(Sequelize.fn("BINARY", Sequelize.col("email")), {
            [Op.like]: `%${query}%`,
          }),
          Sequelize.where(Sequelize.fn("BINARY", Sequelize.col("ninNumber")), {
            [Op.like]: `%${query}%`,
          }),
        ],
      },
      limit: 5,
    });

    // Search in candidates
    searchResults.candidates = await Candidate.findAll({
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn("BINARY", Sequelize.col("firstName")), {
            [Op.like]: `%${query}%`,
          }),
          Sequelize.where(Sequelize.fn("BINARY", Sequelize.col("lastName")), {
            [Op.like]: `%${query}%`,
          }),
          Sequelize.where(Sequelize.fn("BINARY", Sequelize.col("ninNumber")), {
            [Op.like]: `%${query}%`,
          }),
        ],
      },
      limit: 5,
    });

    // Search in payments
    searchResults.payments = await Payment.findAll({
      where: {
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn("BINARY", Sequelize.col("referenceNumber")),
            { [Op.like]: `%${query}%` }
          ),
          { amount: { [Op.like]: `%${query}%` } },
        ],
      },
      limit: 5,
    });

    res.json(searchResults);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
