// digi-thesis-ai/server/models/thesisModel.js
const mongoose = require('mongoose');

const thesisSchema = mongoose.Schema(
    {
        user: { // The user who uploaded the thesis
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Refers to the User model
        },
        title: {
            type: String,
            required: [true, 'Please add a thesis title'],
            trim: true,
        },
        abstract: {
            type: String,
            required: [true, 'Please add an abstract'],
        },
        filePath: { // Path to the uploaded file on the server or cloud storage
            type: String,
            required: true,
        },
        fileName: { // Original file name
            type: String,
            required: true,
        },
        fileExtension: {
            type: String,
            required: true,
        },
        tags: { // Array of tags
            type: [String], // Array of strings
            default: [],
        },
        supervisor: { // Optional supervisor name
            type: String,
            default: '',
        },
        status: { // e.g., 'pending_review', 'plagiarism_checked', 'approved', 'rejected'
            type: String,
            enum: ['uploaded', 'processing', 'completed', 'failed'],
            default: 'uploaded',
        },
        plagiarismScore: { // AI related field
            type: Number,
            default: 0,
        },
        grammarScore: { // AI related field
            type: Number,
            default: 0,
        },
        // You might add more fields here like 'uploadDate', 'lastCheckedDate', etc.
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Thesis = mongoose.model('Thesis', thesisSchema);

module.exports = Thesis;