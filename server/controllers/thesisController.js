// digi-thesis-ai/server/controllers/thesisController.js
const asyncHandler = require('express-async-handler');
const Thesis = require('../models/thesisModel');
const User = require('../models/User'); // Ensure User model is also imported for potential lookups
const path = require('path');
const fs = require('fs'); // For file system operations, useful if you ever need to read the file

// @desc    Upload new thesis
// @route   POST /api/theses/upload
// @access  Private
const uploadThesis = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, no user token');
    }

    const { title, abstract, tags, supervisor } = req.body;
    const thesisFile = req.file;

    if (!thesisFile) {
        res.status(400);
        throw new Error('No thesis file uploaded');
    }

    // Input validation
    if (!title || !abstract || !tags || !supervisor) {
        // If required fields are missing, delete the uploaded file
        fs.unlink(thesisFile.path, (err) => {
            if (err) console.error('Error deleting incomplete upload:', err);
        });
        res.status(400);
        throw new Error('Please fill in all required thesis fields');
    }

    try {
        const thesis = await Thesis.create({
            user: req.user.id,
            title,
            abstract,
            tags: tags.split(',').map(tag => tag.trim()), // Split tags string into array
            supervisor,
            fileName: thesisFile.filename,
            filePath: thesisFile.path, // Store the path where multer saved it
            fileExtension: path.extname(thesisFile.originalname).substring(1), // Get extension without the dot
            analysisStatus: 'pending_analysis', // Set initial status here
            plagiarismScore: 0, // Initialize scores
            grammarScore: 0,
            analysisDetails: {},
        });

        if (thesis) {
            res.status(201).json({
                message: 'Thesis uploaded successfully! Analysis initiated.',
                thesis: {
                    _id: thesis._id,
                    title: thesis.title,
                    analysisStatus: thesis.analysisStatus,
                },
            });

            // Trigger the simulated AI analysis asynchronously
            initiateThesisAnalysis(thesis._id);
        } else {
            // If thesis creation fails for some reason, delete the uploaded file
            fs.unlink(thesisFile.path, (err) => {
                if (err) console.error('Error deleting failed thesis upload:', err);
            });
            res.status(400);
            throw new Error('Invalid thesis data');
        }
    } catch (error) {
        // If an error occurs during database save, delete the uploaded file
        fs.unlink(thesisFile.path, (err) => {
            if (err) console.error('Error deleting error upload:', err);
        });
        console.error('Error during thesis upload:', error);
        res.status(500).json({ message: 'Server error during thesis upload', error: error.message });
    }
});

// @desc    Get all theses for the logged-in user
// @route   GET /api/theses
// @access  Private
const getMyTheses = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, no user token');
    }

    // Find theses by the user ID from the token, and populate the user field (excluding password)
    const theses = await Thesis.find({ user: req.user.id }).populate('user', '-password');

    res.status(200).json(theses);
});

// @desc    Get single thesis by ID
// @route   GET /api/theses/:id
// @access  Private (only accessible by authenticated user who owns it, or admin/supervisor)
const getThesisById = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, no user token');
    }

    // Populate user field to get username/email for display on frontend
    const thesis = await Thesis.findById(req.params.id).populate('user', 'username email');

    if (!thesis) {
        res.status(404);
        throw new new Error('Thesis not found');
    }

    // Optional: Add authorization check if only the owner or specific roles can view
    // If you want to restrict it to the owner:
    if (thesis.user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        res.status(403); // Forbidden
        throw new Error('Not authorized to view this thesis');
    }

    res.status(200).json(thesis);
});

// @desc    Simulate AI Analysis for a Thesis (NEW FUNCTION)
// This function will run in the background without holding up the HTTP response
const initiateThesisAnalysis = async (thesisId) => {
    try {
        console.log(`[AI Simulation] Starting analysis for Thesis ID: ${thesisId}`);

        // Update thesis status to 'analyzing'
        await Thesis.findByIdAndUpdate(thesisId, { analysisStatus: 'analyzing' });

        // Simulate a delay for AI processing (e.g., 5-10 seconds)
        const delay = Math.floor(Math.random() * 6 + 5) * 1000; // 5-10 seconds
        await new Promise(resolve => setTimeout(resolve, delay));

        // Simulate AI results
        const simulatedPlagiarismScore = Math.floor(Math.random() * 30) + 5; // Random score 5-35%
        const simulatedGrammarScore = Math.floor(Math.random() * 20) + 70; // Random score 70-90%
        const simulatedDetails = {
            plagiarism: {
                summary: "Simulated plagiarism detected in introduction and conclusion sections.",
                matched_sources: ["Source A", "Source B"]
            },
            grammar: {
                errors_found: 5,
                suggestions: ["Check subject-verb agreement.", "Improve sentence structure."]
            }
        };

        // Update thesis with analysis results and 'completed' status
        await Thesis.findByIdAndUpdate(
            thesisId,
            {
                analysisStatus: 'completed',
                plagiarismScore: simulatedPlagiarismScore,
                grammarScore: simulatedGrammarScore,
                analysisDetails: simulatedDetails,
            },
            { new: true } // Return the updated document
        );

        console.log(`[AI Simulation] Analysis completed for Thesis ID: ${thesisId}. Scores: Plagiarism ${simulatedPlagiarismScore}%, Grammar ${simulatedGrammarScore}%`);

    } catch (error) {
        console.error(`[AI Simulation] Error during analysis for Thesis ID: ${thesisId}:`, error);
        // Set status to 'failed' if an error occurs
        await Thesis.findByIdAndUpdate(thesisId, { analysisStatus: 'failed' });
    }
};


// Export all the functions that your routes will use
module.exports = {
    uploadThesis,
    getMyTheses,
    getThesisById,
    // initiateThesisAnalysis // Not exported because it's called internally
};