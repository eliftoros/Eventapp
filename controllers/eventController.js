const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getEvents = async (req, res) => {
  try {
    const { categoryId, cityId } = req.query;
    const filters = {};
    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (cityId) filters.cityId = parseInt(cityId);

    const events = await prisma.event.findMany({
      where: filters,
      include: { user: true, category: true }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Eventler alınamadı' });
  }
};

exports.getEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, category: true }
    });
    if (!event) return res.status(404).json({ error: 'Event bulunamadı' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Event alınamadı' });
  }
};


exports.createEvent = async (req, res) => {
  const { title, description, date, categoryId, cityId } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        categoryId: parseInt(categoryId),
        cityId: parseInt(cityId),
        userId: req.user.id
      }
    });
    res.json({ message: 'Event oluşturuldu', event });
  } catch (error) {
    res.status(500).json({ error: 'Event oluşturulamadı' });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, categoryId, cityId } = req.body;
  try {
    const existingEvent = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!existingEvent) return res.status(404).json({ error: 'Event bulunamadı' });
    if (existingEvent.userId !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { title, description, date: new Date(date), categoryId: parseInt(categoryId), cityId: parseInt(cityId) }
    });
    res.json({ message: 'Event güncellendi', updatedEvent });
  } catch (error) {
    res.status(500).json({ error: 'Event güncellenemedi' });
  }
};


exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const existingEvent = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!existingEvent) return res.status(404).json({ error: 'Event bulunamadı' });
    if (existingEvent.userId !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });

    await prisma.event.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Event silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Event silinemedi' });
  }
};
