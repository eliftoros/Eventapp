const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: {
        locations: true,
        events: true
      }
    });
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Şehirler getirilirken hata oluştu." });
  }
};
