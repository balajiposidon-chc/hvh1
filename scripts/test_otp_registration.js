require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testFlow() {
  const email = 'test_flow_' + Date.now() + '@example.com';
  console.log(`Testing Email OTP flow for: ${email}`);

  try {
    // 1. Connect to local database to query OTP and User collections later
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hillandvalley';
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB.');

    // 2. Call the Send OTP API endpoint
    console.log('1. Calling /api/auth/send-otp...');
    const sendResponse = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    console.log('Send OTP status:', sendResponse.status);
    const sendData = await sendResponse.json();
    console.log('Send OTP response:', sendData);

    if (sendResponse.status !== 200) {
      throw new Error('Failed to send OTP');
    }

    // 3. Query the DB to find the created OTP code
    const OTP = (await import('../models/OTP.js')).default;
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
    
    if (!otpRecord) {
      throw new Error('No OTP record found in database');
    }
    
    const code = otpRecord.code;
    console.log(`2. Retrieved OTP from database: ${code}`);

    // Generate a unique phone number to avoid collisions
    const testPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // 4. Try to register with an INVALID OTP code (should fail)
    console.log('3. Submitting registration with INVALID OTP...');
    const invalidRegResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test User',
        email,
        password: 'Password123!',
        phone: testPhone,
        address: '123 Test Street, Test City, TS, 12345',
        otp: '000000' // wrong OTP
      })
    });

    console.log('Invalid registration status:', invalidRegResponse.status);
    const invalidRegData = await invalidRegResponse.json();
    console.log('Invalid registration response:', invalidRegData);
    
    if (invalidRegResponse.status !== 400) {
      throw new Error('Expected 400 Bad Request for invalid OTP, but got ' + invalidRegResponse.status);
    }

    // 5. Try to register with the VALID OTP code (should succeed)
    console.log('4. Submitting registration with VALID OTP...');
    const validRegResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test User',
        email,
        password: 'Password123!',
        phone: testPhone,
        address: '123 Test Street, Test City, TS, 12345',
        otp: code // correct OTP
      })
    });

    console.log('Valid registration status:', validRegResponse.status);
    const validRegData = await validRegResponse.json();
    console.log('Valid registration response:', validRegData);

    if (validRegResponse.status !== 201) {
      throw new Error('Expected 201 Created for valid registration');
    }

    // 6. Verify the OTP record was deleted from database
    const otpStillExists = await OTP.findOne({ email: email.toLowerCase() });
    console.log(`5. Checked if OTP record was deleted after successful registration: ${!otpStillExists ? 'Yes (Deleted)' : 'No (Failed)'}`);
    
    if (otpStillExists) {
      throw new Error('OTP was not deleted after successful verification');
    }

    // 7. Clean up the test user and OTP from database
    const User = (await import('../models/User.js')).default;
    await User.deleteOne({ email: email.toLowerCase() });
    console.log('6. Cleaned up integration test user from database.');

    await mongoose.disconnect();
    console.log('Integration test passed successfully! 🎉');
  } catch (err) {
    console.error('Integration test failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testFlow();
