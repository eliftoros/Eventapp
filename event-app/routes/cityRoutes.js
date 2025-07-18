const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm şehirleri listele
router.get('/', async (req, res) => {
  try {
    const cities = await prisma.city.findMany();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni şehir ekle
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const newCity = await prisma.city.create({
      data: { name },
    });
    res.status(201).json(newCity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
