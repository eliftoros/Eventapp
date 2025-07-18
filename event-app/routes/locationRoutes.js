const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm konumları getir
router.get('/', async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni konum ekle
router.post('/', async (req, res) => {
  const { address } = req.body;
  try {
    const newLocation = await prisma.location.create({
      data: { address },
    });
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
