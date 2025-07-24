const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: {
        locations: true, 
        events: true     
      }
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const city = await prisma.city.findUnique({
      where: { id: parseInt(id) },
      include: { locations: true, events: true },
    });
    if (!city) return res.status(404).json({ error: 'Şehir bulunamadı' });
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/', async (req, res) => {
  let { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Şehir adı zorunludur' });

  name = name.trim();

  try {
  
    const existingCity = await prisma.city.findFirst({
      where: {
        name: name.toLowerCase(),  
      },
    });

    if (existingCity) {
      return res.status(400).json({ error: 'Bu şehir zaten mevcut' });
    }

    
    const newCity = await prisma.city.create({
      data: { name },
    });

    res.status(201).json(newCity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedCity = await prisma.city.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(updatedCity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.city.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Şehir silindi' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
