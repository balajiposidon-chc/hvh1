import mongoose from 'mongoose';
let cached = globalThis.mongoose;
if (!cached) {
    cached = { conn: null, promise: null };
    globalThis.mongoose = cached;
}
async function connectToDatabase() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => mongooseInstance);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
export default connectToDatabase;
