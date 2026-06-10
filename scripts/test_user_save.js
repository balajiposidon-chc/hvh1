require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hillandvalley';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB:', uri);

    // Dynamic import of the ESM User model
    const User = (await import('../models/User.js')).default;
    console.log('User model successfully loaded.');

    const email = 'test_save_flow@test.com';
    
    // Clean up if already exists
    await mongoose.connection.db.collection('users').deleteOne({ email });
    console.log('Cleaned up existing test user.');

    // 1. Simulate registration logic: pre-hash password
    const plainPassword = 'SuperSecretPassword123!';
    const preHashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('1. Plain password:', plainPassword);
    console.log('2. Pre-hashed password:', preHashedPassword);

    // 2. Instantiate User and save
    const user = new User({
      name: 'Test Flow User',
      email: email,
      password: preHashedPassword,
      phone: '1234567890',
      role: 'Customer',
      status: 'active'
    });

    console.log('3. Password before save:', user.password);
    await user.save();
    console.log('4. User saved to database.');

    // 3. Retrieve user from db and select password
    const retrievedUser = await User.findOne({ email }).select('+password');
    console.log('5. Password stored in DB:', retrievedUser.password);

    // 4. Compare using bcryptjs
    const isMatch = await bcrypt.compare(plainPassword, retrievedUser.password);
    console.log('6. Compare plaintext with DB stored password:');
    console.log('   Match result:', isMatch);

    // Clean up
    await mongoose.connection.db.collection('users').deleteOne({ email });
    console.log('Cleaned up test user.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

test();
