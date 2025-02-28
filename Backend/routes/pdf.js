const express = require('express');
const multer = require('multer')
const { uploadPDF } = require('../controllers/pdfController');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


router.post('/upload', upload.single('file'), uploadPDF);

module.exports = router;