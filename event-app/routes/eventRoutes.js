const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm etkinlikleri getir
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        user: true,
        category: true,
        city: true,
        location: true,
        participants: true,
      },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni etkinlik ekle
router.post('/', async (req, res) => {
  const { title, description, date, userId, categoryId, cityId, locationId } = req.body;
  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        userId,
        categoryId,
        cityId,
        locationId,
      },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
