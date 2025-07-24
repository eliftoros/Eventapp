const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Tüm konumları getir
router.get('/', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { city: true }
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Yeni konum ekle
router.post('/', async (req, res) => {
  const { address, cityId } = req.body;
  if (!address || !cityId) {
    return res.status(400).json({ error: 'address ve cityId zorunludur' });
  }

  try {
    const newLocation = await prisma.location.create({
      data: {
        address,
        cityId: parseInt(cityId)
      },
    });
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Location sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.location.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Location silindi.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
