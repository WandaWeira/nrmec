const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/middleware');
const { 
  CandidateParticipation, 
  Candidate, 
  GeneralElectionOppositionCandidate,
  Region, 
  Subregion, 
  District, 
  ConstituencyMunicipality, 
  SubcountyDivision, 
  ParishWard, 
  VillageCell,
  Vote,
  User
} = require('../models');
const { Op } = require('sequelize');

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'General elections routes are working!' });
});

// Get all NRM candidates participating in general elections with their opposition candidates
router.get('/nrm-candidates', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching NRM candidates for general elections...');
    const { electionType, level, regionId, subregionId, districtId, 
      constituencyMunicipalityId, subcountyDivisionId, parishWardId, 
      villageCellId, positionPath } = req.query;

    console.log('Query parameters:', req.query);

    // Build the filter conditions for general elections
    const whereConditions = {
      electionType: 'GENERAL',
      isNominated: true // Only show nominated candidates
    };

    // Add level filter if provided
    if (level) whereConditions.level = level;
    if (positionPath) whereConditions.positionPath = positionPath;

    // Add location filters if provided
    if (regionId) whereConditions.regionId = regionId;
    if (subregionId) whereConditions.subregionId = subregionId;
    if (districtId) whereConditions.districtId = districtId;
    if (constituencyMunicipalityId) whereConditions.constituencyMunicipalityId = constituencyMunicipalityId;
    if (subcountyDivisionId) whereConditions.subcountyDivisionId = subcountyDivisionId;
    if (parishWardId) whereConditions.parishWardId = parishWardId;
    if (villageCellId) whereConditions.villageCellId = villageCellId;

    // Get all nominated NRM candidates for general elections with their information
    const candidates = await CandidateParticipation.findAll({
      where: whereConditions,
      include: [
        { model: Candidate, as: 'candidate' },
        { model: Region, as: 'region' },
        { model: Subregion, as: 'subregion' },
        { model: District, as: 'district' },
        { model: ConstituencyMunicipality, as: 'constituencyMunicipality' },
        { model: SubcountyDivision, as: 'subcountyDivision' },
        { model: ParishWard, as: 'parishWard' },
        { model: VillageCell, as: 'villageCell' },
        { 
          model: Vote, 
          as: 'votes',
          include: [
            { model: User, as: 'recorder', attributes: ['id', 'firstName', 'lastName'] },
            { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] }
          ]
        }
      ],
      order: [
        ['candidate', 'firstName', 'ASC'],
        ['candidate', 'lastName', 'ASC']
      ]
    });

    // Add vote totals and opposition candidate info to each candidate
    const candidatesWithDetails = candidates.map(candidate => {
      const totalVotes = candidate.votes ? candidate.votes.reduce((sum, vote) => sum + vote.votes, 0) : 0;
      const latestVoteRecord = candidate.votes && candidate.votes.length > 0 
        ? candidate.votes.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0]
        : null;

      return {
        ...candidate.toJSON(),
        totalVotes,
        latestVoteRecord,
        hasVotes: candidate.votes && candidate.votes.length > 0,
        oppositionCandidates: [] // Will be populated separately if needed
      };
    });

    console.log(`Found ${candidatesWithDetails.length} NRM candidates for general elections`);
    res.json(candidatesWithDetails);
  } catch (error) {
    console.error('Error fetching NRM candidates for general elections:', error);
    res.status(500).json({ error: 'Failed to fetch NRM candidates for general elections' });
  }
});

// Get all opposition candidates for general elections
router.get('/opposition-candidates', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching opposition candidates for general elections...');
    const { party, regionId, subregionId, districtId } = req.query;

    console.log('Query parameters:', req.query);

    // Build the filter conditions for opposition candidates
    const whereConditions = {
      electionType: 'GENERAL'
    };

    // Add party filter if provided
    if (party) whereConditions.party = party;

    // Note: Opposition candidates might be stored differently
    // For now, return an empty array with proper structure
    const oppositionCandidates = await GeneralElectionOppositionCandidate.findAll({
      where: whereConditions,
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    // Transform to match expected structure
    const candidatesWithDetails = oppositionCandidates.map(candidate => ({
      ...candidate.toJSON(),
      votes: [], // Opposition candidates might not have votes recorded yet
      oppositionCandidates: [], // This would be empty for opposition candidates
      totalVotes: 0,
      hasVotes: false
    }));

    console.log(`Found ${candidatesWithDetails.length} opposition candidates for general elections`);
    res.json(candidatesWithDetails);
  } catch (error) {
    console.error('Error fetching opposition candidates for general elections:', error);
    res.status(500).json({ error: 'Failed to fetch opposition candidates for general elections' });
  }
});

module.exports = router;
