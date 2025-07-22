// digi-thesis-ai/server/controllers/thesisController.js
const asyncHandler = require('express-async-handler');
const Thesis = require('../models/thesisModel');
const path = require('path'); // Node.js built-in module for path manipulation

// @desc    Upload a new thesis
// @route   POST /api/theses/upload
// @access  Private (requires authentication)
const uploadThesis = asyncHandler(async (req, res) => {
    // req.user is available because of protect middleware
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, no user token');
    }

    // Multer adds req.file for single file uploads and req.body for text fields
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded. Please select a thesis file.');
    }

    const { title, abstract, tags, supervisor } = req.body;

    if (!title || !abstract) {
        res.status(400);
        throw new Error('Please add a title and abstract for the thesis.');
    }

    // Get file details from multer
    const filePath = req.file.path; // This is the full path where multer saved the file
    const fileName = req.file.originalname;
    const fileExtension = path.extname(fileName); // e.g., '.pdf', '.docx'

    const thesis = await Thesis.create({
        user: req.user._id, // Associate with the authenticated user
        title,
        abstract,
        filePath,
        fileName,
        fileExtension,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Split comma-separated tags
        supervisor,
        status: 'uploaded', // Initial status
    });

    res.status(201).json({
        message: 'Thesis uploaded successfully!',
        thesis,
    });
});

// @desc    Get all theses for the logged-in user
// @route   GET /api/theses
// @access  Private
const getMyTheses = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, no user token');
    }
    const theses = await Thesis.find({ user: req.user._id });
    res.status(200).json(theses);
});


module.exports = {
    uploadThesis,
    getMyTheses,
};