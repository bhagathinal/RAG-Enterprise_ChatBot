const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });

async function testConnection() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connection Successful');
    
    // Check if any users exist
    const count = await mongoose.model('User', new mongoose.Schema({ email: String })).countDocuments();
    console.log('User count:', count);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
