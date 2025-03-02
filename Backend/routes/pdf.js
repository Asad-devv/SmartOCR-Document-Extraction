const express = require('express');
const multer = require('multer');
const { uploadPDF,getPDF,listPDFs } = require('../controllers/pdfController');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
router.post('/upload', upload.single('file'), uploadPDF);
router.get('/fetch/:pdfId', getPDF);
router.get('/list', listPDFs);

module.exports = router;
