const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library-system';

async function clearDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      await db.collection(col.name).deleteMany({});
      console.log(`🗑️  Cleared: ${col.name}`);
    }

    console.log('\n✅ All data cleared! You can now register fresh accounts.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

clearDatabase();
