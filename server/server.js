// digi-thesis-ai/server/server.js
const express = require('express');
const dotenv = require('dotenv').config();
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware'); // Corrected path and require

const connectDB = require('./config/db'); // <--- Use require for connectDB
const userRoutes = require('./routes/userRoutes'); // <--- Use require for userRoutes (renamed)
const thesisRoutes = require('./routes/thesisRoutes');

// Connect to database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', userRoutes); // Use userRoutes
app.use('/api/theses', thesisRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`.yellow.bold));