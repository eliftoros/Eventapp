const express = require('express');
const cors = require('cors');
require('dotenv').config();


const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const cityRoutes = require('./routes/cityRoutes');
const locationRoutes = require('./routes/locationRoutes'); 
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/cities', cityRoutes);
app.use('/locations', locationRoutes); 

// Test endpoint
app.get('/', (req, res) => {
  res.send('API Çalışıyor 🚀');
});

// Server start
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
