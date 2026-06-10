const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hillandvalley';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const rolesCollection = db.collection('roles');

    console.log('--- ROLES ---');
    const roles = await rolesCollection.find({}).toArray();
    console.log(JSON.stringify(roles, null, 2));

    console.log('--- USERS ---');
    const users = await usersCollection.find({}).toArray();
    console.log(JSON.stringify(users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status
    })), null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
