const express = require('express');
const { saveShapes, getShapes } = require('../controllers/shapeController');

const router = express.Router();

router.post('/save', saveShapes);
router.get('/get/:pdfId/:pageNumber', getShapes);

module.exports = router;
