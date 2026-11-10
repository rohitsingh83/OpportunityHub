const mongoose = require('mongoose');

/**
 * Connects Mongoose to MongoDB or initializes the embedded in-memory database.
 *
 * 1. If MONGO_URI is specified (Atlas or live local instance) and USE_IN_MEMORY_DB != 'true',
 *    it connects directly via Mongoose.
 * 2. If USE_IN_MEMORY_DB=true (or connection to local MongoDB is unavailable),
 *    it uses the zero-dependency pure-JS embedded store (persisted in data/db.json).
 * 3. Automatically seeds initial opportunities and applications if the store/collection is empty.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internship_portal';
  const forceInMemory = process.env.USE_IN_MEMORY_DB === 'true';

  if (!forceInMemory) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ MongoDB connected: ${uri.replace(/\/\/.*@/, '//***@')}`);
    } catch (err) {
      console.log('ℹ️  Could not connect to external MongoDB server.');
      console.log('💡 Activated zero-dependency embedded database (pure JavaScript, instant & portable).');
    }
  } else {
    console.log('💡 Running with embedded in-memory database (USE_IN_MEMORY_DB=true).');
  }

  // Auto-seed sample opportunities and applications if empty
  try {
    const { seedDatabase } = require('../seed/seed');
    await seedDatabase({ force: false });
  } catch (seedErr) {
    console.warn('Auto-seed check note:', seedErr.message);
  }
}

module.exports = connectDB;
