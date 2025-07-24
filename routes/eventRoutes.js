const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


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


router.post('/', async (req, res) => {
  let { name, title, description, date, userId, categoryId, cityId, locationId } = req.body;

  if (!name || !date || !userId || !categoryId || !cityId) {
    return res.status(400).json({ error: 'name, date, userId, categoryId ve cityId alanları zorunludur.' });
  }

  const eventDate = new Date(date);
  if (isNaN(eventDate)) {
    return res.status(400).json({ error: 'Geçersiz tarih formatı.' });
  }

  try {
    const newEvent = await prisma.event.create({
      data: {
        name,
        title,
        description,
        date: eventDate,
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
