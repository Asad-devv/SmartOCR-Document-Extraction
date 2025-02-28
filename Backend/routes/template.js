const express = require('express');
const { saveTemplate, getTemplates } = require('../controllers/templateController');

const router = express.Router();

router.post('/save', saveTemplate);
router.get('/get', getTemplates);

module.exports = router;