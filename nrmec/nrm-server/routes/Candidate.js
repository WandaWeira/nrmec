const express = require('express');
const { 
    NationalCandidate,
    DistrictCandidate,
    ConstituencyMunicipalityCandidate,
    SubcountiesDivisionsCandidate,
    ParishesWardsCandidate,
    VillageCellCandidate 
} = require('../models');


const router = express.Router();
const { Candidate, Election, User, sequelize } = require('../models');
const { Op } = require('sequelize');


// Create a new candidate
router.get('/', async (req, res) => {
        res.status(400).json({ error: "wena wena wena" });
});

// Create a new candidate
router.post('/', async (req, res) => {
    try {
        const { electionId, ...candidateData } = req.body;
        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({ error: 'Election not found' });
        }
        const candidate = await Candidate.create({ ...candidateData, electionId });
        res.status(201).json(candidate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create a new candidate for a specific election type
router.post('/election/:electionId', async (req, res) => {
    try {
        const { electionId } = req.params;
        const candidateData = req.body;

        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({ error: 'Election not found' });
        }

        const candidate = await Candidate.create({
            ...candidateData,
            electionId
        });

        res.status(201).json(candidate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all candidates for a specific election type
router.get('/election/:electionId', async (req, res) => {
    try {
        const candidates = await Candidate.findAll({ where: { electionId: req.params.electionId } });
        res.status(200).json(candidates);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Search candidates by name or NIN
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        console.log('Search query------:', query);
        
        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }
        
        // Check first if the query exactly matches a NIN number
        let candidates = await Candidate.findAll({
            where: {
                ninNumber: query
            },
            limit: 10
        });
        
        // If no exact NIN match, then try partial matches on name and NIN
        if (candidates.length === 0) {
            candidates = await Candidate.findAll({
                where: {
                    [Op.or]: [
                        { ninNumber: { [Op.like]: `%${query}%` } },
                        { firstName: { [Op.like]: `%${query}%` } },
                        { lastName: { [Op.like]: `%${query}%` } },
                        sequelize.where(
                            sequelize.fn('CONCAT', sequelize.col('firstName'), ' ', sequelize.col('lastName')),
                            { [Op.like]: `%${query}%` }
                        )
                    ]
                },
                limit: 10
            });
        }
        
        res.status(200).json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a candidate by ID
router.get('/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (candidate) {
            res.status(200).json(candidate);
        } else {
            res.status(404).json({ error: 'Candidate not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a candidate
router.put('/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (candidate) {
            await candidate.update(req.body);
            res.status(200).json(candidate);
        } else {
            res.status(404).json({ error: 'Candidate not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a candidate
router.delete('/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (candidate) {
            await candidate.destroy();
            res.status(204).json();
        } else {
            res.status(404).json({ error: 'Candidate not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Nominate a candidate
router.post('/:id/nominate', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (candidate) {
            candidate.nominatedBy = req.body.nominatedBy;
            await candidate.save();
            res.status(200).json(candidate);
        } else {
            res.status(404).json({ error: 'Candidate not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update votes for a candidate
router.post('/:id/vote', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (candidate) {
            candidate.votes += req.body.votes;
            await candidate.save();
            res.status(200).json(candidate);
        } else {
            res.status(404).json({ error: 'Candidate not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Check if a candidate is the winner in a specific election type
router.get('/:id/is-winner', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        const electionId = candidate.electionId;
        const candidates = await Candidate.findAll({ where: { electionId } });
        const maxVotes = Math.max(...candidates.map(c => c.votes));

        if (candidate.votes === maxVotes) {
            res.status(200).json({ isWinner: true });
        } else {
            res.status(200).json({ isWinner: false });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get candidate administration details by NIN number
router.get('/admin-details/:ninNumber', async (req, res) => {
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
        }        res.status(200).json({
            baseInfo: baseCandidate,
            administrationDetails: candidateDetail
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all candidate participations
router.get('/participations/:candidateId', async (req, res) => {
    try {
        const { candidateId } = req.params;
        
        // Check if candidateId is a number or NIN
        const isNumeric = !isNaN(candidateId) && !isNaN(parseFloat(candidateId));
        
        let query = {};
        
        if (isNumeric) {
            // If it's a numeric ID, use it directly
            query = { candidateId: parseInt(candidateId, 10) };
        } else {
            // If it's not numeric, it might be a NIN, so find the candidate first
            const candidate = await sequelize.models.Candidate.findOne({
                where: { ninNumber: candidateId }
            });
            
            if (!candidate) {
                return res.status(404).json({ error: 'Candidate not found with the provided ID/NIN' });
            }
            
            query = { candidateId: candidate.id };
        }
        
        const participations = await sequelize.models.CandidateParticipation.findAll({
            where: query,
            include: [
                { model: sequelize.models.Region, as: 'region' },
                { model: sequelize.models.Subregion, as: 'subregion' },
                { model: sequelize.models.District, as: 'district' },
                { model: sequelize.models.ConstituencyMunicipality, as: 'constituencyMunicipality' },
                { model: sequelize.models.SubcountyDivision, as: 'subcountyDivision' },
                { model: sequelize.models.ParishWard, as: 'parishWard' },
                { model: sequelize.models.VillageCell, as: 'villageCell' },
                { 
                    model: sequelize.models.Payment, 
                    as: 'payments',
                    required: false
                }
            ]
        });
        
        res.status(200).json(participations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
