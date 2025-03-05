// routes/template.js
const express = require('express');
const multer= require ('multer')
const { saveTemplate, getTemplates, applyTemplate } = require('../controllers/templateController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post('/save', saveTemplate);
router.get('/get', getTemplates);
router.post('/apply', upload.single("pdf"), applyTemplate);
module.exports = router;