const express = require('express');
const router = express.Router();
const { Sequelize, Op } = require('sequelize');
const { Vote, CandidateParticipation, Candidate, Region, Subregion, District, 
  ConstituencyMunicipality, SubcountyDivision, ParishWard, VillageCell, User } = require('../models');
const { authMiddleware } = require('../middleware/middleware');

// Get all nominated candidates for vote entry
router.get('/candidates', authMiddleware, async (req, res) => {
  console.log('Fetching nominated candidates for vote entry...');
  try {
    const { electionType, level, regionId, subregionId, districtId, 
      constituencyMunicipalityId, subcountyDivisionId, parishWardId, 
      villageCellId, positionPath } = req.query;

    console.log('Query parameters:', req.query);

    // Build the filter conditions - only get nominated candidates
    const whereConditions = {
      electionType,
      level,
      isNominated: true // Only show nominated candidates
    };

    if (positionPath) {
      whereConditions.positionPath = positionPath;
    }

    if (regionId) whereConditions.regionId = regionId;
    if (subregionId) whereConditions.subregionId = subregionId;
    if (districtId) whereConditions.districtId = districtId;
    if (constituencyMunicipalityId) whereConditions.constituencyMunicipalityId = constituencyMunicipalityId;
    if (subcountyDivisionId) whereConditions.subcountyDivisionId = subcountyDivisionId;
    if (parishWardId) whereConditions.parishWardId = parishWardId;
    if (villageCellId) whereConditions.villageCellId = villageCellId;

    // Get all nominated candidates with their vote information
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

    // Add vote totals to each candidate
    const candidatesWithVotes = candidates.map(candidate => {
      const totalVotes = candidate.votes ? candidate.votes.reduce((sum, vote) => sum + vote.votes, 0) : 0;
      const latestVoteRecord = candidate.votes && candidate.votes.length > 0 
        ? candidate.votes.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0]
        : null;

      return {
        ...candidate.toJSON(),
        totalVotes,
        latestVoteRecord,
        hasVotes: candidate.votes && candidate.votes.length > 0
      };
    });

    console.log(`Found ${candidatesWithVotes.length} nominated candidates`);
    res.json(candidatesWithVotes);
  } catch (error) {
    console.error('Error fetching nominated candidates:', error);
    res.status(500).json({ error: 'Failed to fetch nominated candidates' });
  }
});

// Get vote summary/statistics
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const { electionType, level, regionId, subregionId, districtId, 
      constituencyMunicipalityId, subcountyDivisionId, parishWardId, 
      villageCellId, positionPath } = req.query;

    const whereConditions = {
      electionType,
      level
    };

    if (positionPath) whereConditions.positionPath = positionPath;
    if (regionId) whereConditions.regionId = regionId;
    if (subregionId) whereConditions.subregionId = subregionId;
    if (districtId) whereConditions.districtId = districtId;
    if (constituencyMunicipalityId) whereConditions.constituencyMunicipalityId = constituencyMunicipalityId;
    if (subcountyDivisionId) whereConditions.subcountyDivisionId = subcountyDivisionId;
    if (parishWardId) whereConditions.parishWardId = parishWardId;
    if (villageCellId) whereConditions.villageCellId = villageCellId;

    // Get vote summary grouped by position
    const voteSummary = await Vote.findAll({
      where: whereConditions,
      include: [
        {
          model: CandidateParticipation,
          as: 'candidateParticipation',
          include: [
            { model: Candidate, as: 'candidate' }
          ]
        }
      ],
      attributes: [
        'positionPath',
        'candidateParticipationId',
        [Sequelize.fn('SUM', Sequelize.col('votes')), 'totalVotes']
      ],
      group: ['positionPath', 'candidateParticipationId', 'candidateParticipation.id', 'candidateParticipation->candidate.id'],
      order: [['positionPath', 'ASC'], [Sequelize.fn('SUM', Sequelize.col('votes')), 'DESC']]
    });

    res.json(voteSummary);
  } catch (error) {
    console.error('Error fetching vote summary:', error);
    res.status(500).json({ error: 'Failed to fetch vote summary' });
  }
});

// Record votes for a candidate
router.post('/record', authMiddleware, async (req, res) => {
  try {
    const { 
      candidateParticipationId, 
      votes, 
      electionType, 
      level, 
      positionPath,
      regionId,
      subregionId,
      districtId,
      constituencyMunicipalityId,
      subcountyDivisionId,
      parishWardId,
      villageCellId,
      notes 
    } = req.body;

    console.log('Recording votes:', req.body);

    // Validate that the candidate participation exists and is nominated
    const candidateParticipation = await CandidateParticipation.findOne({
      where: { 
        id: candidateParticipationId,
        isNominated: true 
      }
    });

    if (!candidateParticipation) {
      return res.status(404).json({ error: 'Nominated candidate participation record not found' });
    }

    // Check if votes already exist for this candidate participation
    const existingVote = await Vote.findOne({
      where: { candidateParticipationId }
    });

    let voteRecord;

    if (existingVote) {
      // Update existing vote record
      voteRecord = await existingVote.update({
        votes,
        updatedBy: req.user.id,
        updatedAt: new Date(),
        notes
      });
    } else {
      // Create new vote record
      voteRecord = await Vote.create({
        candidateParticipationId,
        votes,
        electionType,
        level,
        positionPath,
        regionId,
        subregionId,
        districtId,
        constituencyMunicipalityId,
        subcountyDivisionId,
        parishWardId,
        villageCellId,
        recordedBy: req.user.id,
        notes
      });
    }

    // Fetch the complete vote record with associations
    const completeVoteRecord = await Vote.findByPk(voteRecord.id, {
      include: [
        {
          model: CandidateParticipation,
          as: 'candidateParticipation',
          include: [
            { model: Candidate, as: 'candidate' }
          ]
        },
        { model: User, as: 'recorder', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    res.status(200).json({ 
      message: existingVote ? 'Votes updated successfully' : 'Votes recorded successfully',
      vote: completeVoteRecord
    });
  } catch (error) {
    console.error('Error recording votes:', error);
    res.status(500).json({ error: 'Failed to record votes' });
  }
});

// Delete vote record
router.delete('/delete/:voteId', authMiddleware, async (req, res) => {
  try {
    const { voteId } = req.params;

    const voteRecord = await Vote.findByPk(voteId);
    if (!voteRecord) {
      return res.status(404).json({ error: 'Vote record not found' });
    }

    await voteRecord.destroy();

    res.status(200).json({ 
      message: 'Vote record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vote record:', error);
    res.status(500).json({ error: 'Failed to delete vote record' });
  }
});

// Get votes for a specific candidate participation
router.get('/candidate/:candidateParticipationId', authMiddleware, async (req, res) => {
  try {
    const { candidateParticipationId } = req.params;

    const votes = await Vote.findAll({
      where: { candidateParticipationId },
      include: [
        { model: User, as: 'recorder', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['recordedAt', 'DESC']]
    });

    const totalVotes = votes.reduce((sum, vote) => sum + vote.votes, 0);

    res.json({
      votes,
      totalVotes,
      recordCount: votes.length
    });
  } catch (error) {
    console.error('Error fetching candidate votes:', error);
    res.status(500).json({ error: 'Failed to fetch candidate votes' });
  }
});

module.exports = router;
