require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const opportunityRoutes = require('./routes/opportunityRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Internship & Job Portal API is running' });
});

// Routes
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);

// ---------- Production: serve React build ----------
const clientBuild = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(clientBuild));

// Client-side routing fallback – any non-API GET serves index.html
app.get('*', (req, res, next) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientBuild, 'index.html'));
});

// 404 + error handling (catches unmatched /api/* routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

module.exports = app;
