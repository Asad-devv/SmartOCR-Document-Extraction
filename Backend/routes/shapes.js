const express = require('express');
const { embedShapesInPDF,drawShapesOnPDF,getShapes } = require('../controllers/shapeController');

const router = express.Router();


router.post('/embed', embedShapesInPDF);
router.post('/draw', drawShapesOnPDF);
router.get('/get/:pdfId', getShapes);


module.exports = router;
