const express = require('express');
const { embedShapesInPDF,drawShapesOnPDF,getShapes,processPageWithShapes } = require('../controllers/shapeController');

const router = express.Router();


router.post('/embed', embedShapesInPDF);
router.post('/draw', drawShapesOnPDF);
router.get('/get/:pdfId', getShapes);
router.post('/process-page', processPageWithShapes);

module.exports = router;
