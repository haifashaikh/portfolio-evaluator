require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middleware/errorHandler');
const Report = require('./models/Report');

const app = express();

// ── Connect to MongoDB ────────────────────────────────────────────────────────

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', profileRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Scheduled cache cleanup (runs every hour) ─────────────────────────────────
// MongoDB TTL index handles auto-deletion, but this is a manual safety net
cron.schedule('0 * * * *', async () => {
  try {
    const result = await Report.deleteMany({ expiresAt: { $lt: new Date() } });
    if (result.deletedCount > 0) {
      console.log(`[CRON] Cleaned up ${result.deletedCount} expired report(s)`);
    }
  } catch (err) {
    console.error('[CRON] Cache cleanup error:', err.message);
  }
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
    );
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Stop the other process or change PORT in server/.env.`
      );
      process.exit(1);
    }

    console.error('Server startup error:', err.message);
    process.exit(1);
  });
};

startServer();

module.exports = app;
