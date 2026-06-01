import bcryptjs from 'bcryptjs';
import connectToDatabase from '../lib/mongodb';
import User from '../lib/models/User';
async function run() {
    await connectToDatabase();
    const existing = await User.findOne({ email: 'admin@store.com' });
    if (existing) {
        console.log('Admin user already exists');
        process.exit(0);
    }
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const hashed = await bcryptjs.hash(password, 10);
    await User.create({
        name: 'Main Admin',
        email: 'admin@store.com',
        password: hashed,
        role: 'admin',
        phone: '',
        address: '',
        status: 'active',
    });
    console.log('Admin user created: admin@store.com');
    process.exit(0);
}
run().catch((error) => {
    console.error(error);
    process.exit(1);
});
