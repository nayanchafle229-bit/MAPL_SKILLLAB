const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
  }

  // Fix: remove dbName option — it conflicts when dbName is already in the URI
  // The URI already contains /smartquiz — don't pass dbName separately
  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
  };

  console.log('⏳ Connecting to MongoDB Atlas...');
  console.log('   Host: cluster0.arcqild.mongodb.net');

  try {
    const conn = await mongoose.connect(uri, options);
    console.log('✅ MongoDB Connected:', conn.connection.host);
    console.log('   Database:', conn.connection.name);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected — will auto-reconnect');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

  } catch (err) {
    console.error('❌ MongoDB connection FAILED');
    console.error('   Error:', err.message);
    console.error('');
    console.error('   ── CHECKLIST ──────────────────────────────────────');
    console.error('   1. Atlas Network Access: add 0.0.0.0/0 (allow all IPs)');
    console.error('      cloud.mongodb.com → Security → Network Access');
    console.error('   2. DB user: MAPL_db_user must have readWrite on smartquiz');
    console.error('   3. URI in .env must not have spaces or line breaks');
    console.error('   4. Cluster is not paused (free tier pauses after 60 days idle)');
    console.error('   ────────────────────────────────────────────────────');
    process.exit(1);
  }
};

module.exports = connectDB;
