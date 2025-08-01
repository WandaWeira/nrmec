// nrm-server/routes/Registrar.js
const express = require('express');
const router = express.Router();
const { Registrar, VillageCell, ParishWard, SubcountyDivision, ConstituencyMunicipality } = require('../models');
const { authMiddleware } = require('../middleware/middleware');

// Get all registrars with filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      administrativeUnitType, 
      isActive, 
      startDate, 
      endDate 
    } = req.query;

    const where = {};
    if (administrativeUnitType) where.administrativeUnitType = administrativeUnitType;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (startDate) where.startDate = { [Op.gte]: new Date(startDate) };
    if (endDate) where.endDate = { [Op.lte]: new Date(endDate) };

    const registrars = await Registrar.findAll({
      where,
      include: [
        {
          model: VillageCell,
          required: false,
        },
        {
          model: ParishWard,
          required: false,
        },
        {
          model: SubcountyDivision,
          required: false,
        },
        {
          model: ConstituencyMunicipality,
          required: false,
        },
      ],
    });

    res.json(registrars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new registrar
router.post('/', authMiddleware, async (req, res) => {
  try {
    const registrar = await Registrar.create(req.body);
    res.status(201).json(registrar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update registrar
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const registrar = await Registrar.findByPk(req.params.id);
    if (!registrar) {
      return res.status(404).json({ message: 'Registrar not found' });
    }
    await registrar.update(req.body);
    res.json(registrar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete registrar
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const registrar = await Registrar.findByPk(req.params.id);
    if (!registrar) {
      return res.status(404).json({ message: 'Registrar not found' });
    }
    await registrar.destroy();
    res.json({ message: 'Registrar deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;