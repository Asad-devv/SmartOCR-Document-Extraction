const express = require('express');
const { embedShapesInPDF,drawShapesOnPDF,getShapes,processPageWithShapes } = require('../controllers/shapeController');
const multer = require("multer");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/embed', embedShapesInPDF);
router.post('/draw', drawShapesOnPDF);
router.get('/get/:pdfId', getShapes);
router.post("/process-page", upload.single("pdf"), processPageWithShapes);

module.exports = router;
