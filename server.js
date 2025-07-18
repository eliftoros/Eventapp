const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const locationRoutes = require('./routes/locationRoutes');
const eventParticipantRoutes = require('./routes/eventParticipantRoutes');
const cityRoutes = require('./routes/cityRoutes'); 

const app = express(); 

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/locations', locationRoutes);
app.use('/eventParticipants', eventParticipantRoutes);
app.use('/cities', cityRoutes);

app.get('/', (req, res) => res.send('API Çalışıyor 🚀'));

app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
