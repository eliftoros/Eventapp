const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm katılımcıları getir
router.get('/', async (req, res) => {
  try {
    const participants = await prisma.eventParticipant.findMany({
      include: { user: true, event: true },
    });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Etkinliğe katılımcı ekle
router.post('/', async (req, res) => {
  const { userId, eventId } = req.body;
  try {
    const newParticipant = await prisma.eventParticipant.create({
      data: { userId, eventId },
    });
    res.status(201).json(newParticipant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Katılımcı sil
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.eventParticipant.delete({ where: { id } });
    res.json({ message: 'Katılımcı silindi' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
