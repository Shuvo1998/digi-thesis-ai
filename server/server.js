// digi-thesis-ai/server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; // <-- Import auth routes

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('DigiThesis Main API (Node.js) is running!');
});

// API Routes
app.use('/api/auth', authRoutes); // <-- Use auth routes here

app.listen(PORT, () => {
    console.log(`Main Node.js Server running on port ${PORT}`);
});