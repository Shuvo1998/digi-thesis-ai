// digi-thesis-ai/server/config/db.js
const mongoose = require('mongoose'); // Use require
const dotenv = require('dotenv');     // Use require

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline); // Add colors for consistency
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

module.exports = connectDB; // Use module.exports