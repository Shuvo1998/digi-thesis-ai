// digi-thesis-ai/server/routes/thesisRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadThesis, getMyTheses } = require('../controllers/thesisController');
const { protect } = require('../middleware/authMiddleware'); // For protected routes

const router = express.Router();

// Configure Multer storage
// Files will be saved in 'digi-thesis-ai/server/uploads' directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create the 'uploads' directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../uploads');
        require('fs').mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: fieldname-timestamp.ext
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// File filter for Multer (optional, but good for security)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed!'), false);
    }
};

// Initialize Multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 25 }, // Limit file size to 25MB (adjust as needed)
});

// Define thesis routes
router.post('/upload', protect, upload.single('thesisFile'), uploadThesis); // 'thesisFile' matches the formData.append name from frontend
router.get('/', protect, getMyTheses); // Route to get all theses for the logged-in user

module.exports = router;