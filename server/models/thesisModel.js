// digi-thesis-ai/server/models/thesisModel.js
const mongoose = require('mongoose');

const thesisSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        abstract: {
            type: String,
            required: [true, 'Please add an abstract'],
        },
        tags: {
            type: [String], // Array of strings
            default: [],
        },
        supervisor: {
            type: String,
            required: [true, 'Please add a supervisor name'],
        },
        fileName: {
            type: String,
            required: true,
        },
        filePath: { // Path to the uploaded file
            type: String,
            required: true,
        },
        fileExtension: {
            type: String,
            required: true,
        },
        // --- NEW FIELDS FOR AI ANALYSIS ---
        analysisStatus: {
            type: String,
            enum: ['uploaded', 'pending_analysis', 'analyzing', 'completed', 'failed'],
            default: 'uploaded', // Initial status after upload
        },
        plagiarismScore: {
            type: Number,
            default: 0, // Percentage from 0-100
        },
        grammarScore: {
            type: Number,
            default: 0, // Percentage from 0-100 (e.g., 100 for perfect grammar)
        },
        analysisDetails: { // To store more detailed AI feedback (e.g., JSON)
            type: mongoose.Schema.Types.Mixed, // Allows flexible data types
            default: {},
        },
        // --- END NEW FIELDS ---
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Thesis', thesisSchema);