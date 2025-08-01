const express = require('express');
const router = express.Router();
const { 
  Candidate, 
  CandidateParticipation,
  Region,
  Subregion,
  District,
  ConstituencyMunicipality,
  SubcountyDivision,
  ParishWard,
  VillageCell
} = require('../models');
const { Op } = require('sequelize');

// Get all candidates for a specific administrative level
router.get('/candidates/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const { regionId, subregionId, districtId, constituencyMunicipalityId, subcountyDivisionId, parishWardId, villageCellId } = req.query;

    const whereClause = {
      level: level.toUpperCase(),
      electionType: 'PRIMARIES'
    };

    // Add location filters based on level
    if (regionId) whereClause.regionId = regionId;
    if (subregionId) whereClause.subregionId = subregionId;
    if (districtId) whereClause.districtId = districtId;
    if (constituencyMunicipalityId) whereClause.constituencyMunicipalityId = constituencyMunicipalityId;
    if (subcountyDivisionId) whereClause.subcountyDivisionId = subcountyDivisionId;
    if (parishWardId) whereClause.parishWardId = parishWardId;
    if (villageCellId) whereClause.villageCellId = villageCellId;    const participations = await CandidateParticipation.findAll({
      where: whereClause,
      include: [
        { 
          model: Candidate,
          attributes: ['id', 'firstName', 'lastName', 'ninNumber', 'phoneNumber', 'electionType'],
          as: 'candidate'
        },
        { model: Region, attributes: ['id', 'name'], as: 'region' },
        { model: Subregion, attributes: ['id', 'name'], as: 'subregion' },
        { model: District, attributes: ['id', 'name'], as: 'district' },
        { model: ConstituencyMunicipality, attributes: ['id', 'name'], as: 'constituencyMunicipality' },
        { model: SubcountyDivision, attributes: ['id', 'name'], as: 'subcountyDivision' },
        { model: ParishWard, attributes: ['id', 'name'], as: 'parishWard' },
        { model: VillageCell, attributes: ['id', 'name'], as: 'villageCell' }
      ]
    });

    res.json(participations);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new candidate participation
router.post('/candidates', async (req, res) => {
  try {
    const {
      candidate, // This will contain candidate details
      level,
      category,
      position,
      regionId,
      subregionId,
      districtId,
      constituencyMunicipalityId,
      subcountyDivisionId,
      parishWardId,
      villageCellId,
      year,
    } = req.body;

    // First create the candidate
    const newCandidate = await Candidate.create({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      ninNumber: candidate.ninNumber,
      phoneNumber: candidate.phoneNumber,
      electionType: 'PRIMARIES',
      year,
      gender: candidate.gender,
      dateOfBirth: candidate.dateOfBirth,
      email: candidate.email,
      address: candidate.address,
      occupation: candidate.occupation,
    });

    // Create position path
    const positionPath = `PRIMARIES.${level}.${category}.${position}`;

    // Then create the participation using the new candidate's ID
    const participation = await CandidateParticipation.create({
      candidateId: newCandidate.id,
      electionType: 'PRIMARIES',
      level: level.toUpperCase(),
      positionPath,
      category,
      position,
      regionId,
      subregionId,
      districtId,
      constituencyMunicipalityId,
      subcountyDivisionId,
      parishWardId,
      villageCellId,
      year,
      status: 'pending'
    });

    // Return both the candidate and participation data
    res.status(201).json({
      candidate: newCandidate,
      participation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a candidate participation
router.put('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      position,
      regionId,
      subregionId,
      districtId,
      constituencyMunicipalityId,
      subcountyDivisionId,
      parishWardId,
      villageCellId,
      status,
      isQualified,
      vote
    } = req.body;

    const participation = await CandidateParticipation.findByPk(id);
    if (!participation) {
      return res.status(404).json({ message: 'Candidate participation not found' });
    }

    // Update position path if category or position changed
    if (category || position) {
      const positionPath = `PRIMARIES.${participation.level}.${category || participation.category}.${position || participation.position}`;
      await participation.update({ positionPath });
    }

    await participation.update({
      category,
      position,
      regionId,
      subregionId,
      districtId,
      constituencyMunicipalityId,
      subcountyDivisionId,
      parishWardId,
      villageCellId,
      status,
      isQualified,
      vote
    });

    res.json(participation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a candidate participation
router.delete('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const participation = await CandidateParticipation.findByPk(id);
    
    if (!participation) {
      return res.status(404).json({ message: 'Candidate participation not found' });
    }

    await participation.destroy();
    res.json({ message: 'Candidate participation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available regions with candidates
router.get('/available-regions', async (req, res) => {
  try {
    const { level } = req.query;
    const participations = await CandidateParticipation.findAll({
      where: { level: level?.toUpperCase() || 'DISTRICT', electionType: 'PRIMARIES' },
      attributes: ['regionId'],
      group: ['regionId'],
      raw: true,
    });
    const regionIds = participations.map(p => p.regionId).filter(Boolean);
    const regions = await Region.findAll({
      where: { id: regionIds },
      attributes: ['id', 'name'],
    });
    res.json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available subregions with candidates for a region
router.get('/available-subregions', async (req, res) => {
  try {
    const { regionId } = req.query;
    const participations = await CandidateParticipation.findAll({
      where: { regionId, electionType: 'PRIMARIES' },
      attributes: ['subregionId'],
      group: ['subregionId'],
      raw: true,
    });
    const subregionIds = participations.map(p => p.subregionId).filter(Boolean);
    const subregions = await Subregion.findAll({
      where: { id: subregionIds },
      attributes: ['id', 'name'],
    });
    res.json(subregions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available districts with candidates for a subregion
router.get('/available-districts', async (req, res) => {
  try {
    const { subregionId } = req.query;
    const participations = await CandidateParticipation.findAll({
      where: { subregionId, electionType: 'PRIMARIES' },
      attributes: ['districtId'],
      group: ['districtId'],
      raw: true,
    });
    const districtIds = participations.map(p => p.districtId).filter(Boolean);
    const districts = await District.findAll({
      where: { id: districtIds },
      attributes: ['id', 'name'],
    });
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available constituencies/municipalities with candidates for a district
router.get('/available-constituencies', async (req, res) => {
  try {
    const { districtId } = req.query;
    const participations = await CandidateParticipation.findAll({
      where: { districtId, electionType: 'PRIMARIES' },
      attributes: ['constituencyMunicipalityId'],
      group: ['constituencyMunicipalityId'],
      raw: true,
    });
    const constituencyIds = participations.map(p => p.constituencyMunicipalityId).filter(Boolean);
    const constituencies = await ConstituencyMunicipality.findAll({
      where: { id: constituencyIds },
      attributes: ['id', 'name'],
    });
    res.json(constituencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available subcounties/divisions with candidates for a constituency/municipality
router.get('/available-subcounties', async (req, res) => {
  try {
    const { constituencyMunicipalityId } = req.query;
    const participations = await CandidateParticipation.findAll({
      where: { constituencyMunicipalityId, electionType: 'PRIMARIES' },
      attributes: ['subcountyDivisionId'],
      group: ['subcountyDivisionId'],
      raw: true,
    });
    const subcountyIds = participations.map(p => p.subcountyDivisionId).filter(Boolean);
    const subcounties = await SubcountyDivision.findAll({
      where: { id: subcountyIds },
      attributes: ['id', 'name'],
    });
    res.json(subcounties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available parishes/wards with candidates for a subcounty/division
router.get('/available-parishes', async (req, res) => {
  try {
    const { subcountyDivisionId } = req.query;
    const participations = await CandidateParticipation.findAll({
      where: { subcountyDivisionId, electionType: 'PRIMARIES' },
      attributes: ['parishWardId'],
      group: ['parishWardId'],
      raw: true,
    });
    const parishIds = participations.map(p => p.parishWardId).filter(Boolean);
    const parishes = await ParishWard.findAll({
      where: { id: parishIds },
      attributes: ['id', 'name'],
    });
    res.json(parishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available villages/cells with candidates for a parish/ward
router.get('/available-villages', async (req, res) => {
  try {
    const { parishWardId } = req.query;
    const participations = await CandidateParticipation.findAll({
      where: { parishWardId, electionType: 'PRIMARIES' },
      attributes: ['villageCellId'],
      group: ['villageCellId'],
      raw: true,
    });
    const villageIds = participations.map(p => p.villageCellId).filter(Boolean);
    const villages = await VillageCell.findAll({
      where: { id: villageIds },
      attributes: ['id', 'name'],
    });
    res.json(villages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
