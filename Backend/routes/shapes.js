const express = require('express');
const { embedShapesInPDF,drawShapesOnPDF } = require('../controllers/shapeController');

const router = express.Router();


router.post('/embed', embedShapesInPDF);
router.post('/draw', drawShapesOnPDF);



module.exports = router;
