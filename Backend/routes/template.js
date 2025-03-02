// routes/template.js
const express = require('express');
const { saveTemplate, getTemplates, applyTemplate } = require('../controllers/templateController');

const router = express.Router();

router.post('/save', saveTemplate);
router.get('/get', getTemplates);
router.post('/apply', applyTemplate);

module.exports = router;