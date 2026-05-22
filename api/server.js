require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins dynamically in development
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/referees', require('./routes/referees'));
app.use('/api/championships', require('./routes/championships'));
app.use('/api/matches', require('./routes/matches'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'GameTime API', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🏀 GameTime API corriendo en http://localhost:${PORT}`);
});
