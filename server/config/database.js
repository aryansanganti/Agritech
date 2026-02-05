const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || process.env.mongodb_URI;

        if (!mongoURI) {
            console.warn('⚠️ MongoDB URI not found in .env - running without database');
            return null;
        }

        await mongoose.connect(mongoURI);

        console.log('✅ MongoDB Connected Successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.warn('⚠️ Continuing without database - data will not be persisted');
        return null;
    }
};

module.exports = connectDB;
