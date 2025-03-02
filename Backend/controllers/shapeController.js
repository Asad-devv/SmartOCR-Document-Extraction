const Shape = require('../models/Shape');
const { PDFDocument, rgb } = require('pdf-lib'); 
const fs = require('fs');
const PDF = require('../models/Pdf');
exports.getShapes = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const shapeRecords = await Shape.find({ pdfId });
        if (!shapeRecords) {
            return res.status(200).json({ shapes: [] });
        }
        res.status(200).json({ shapes: shapeRecords });
    } catch (error) {
        console.error('Error fetching shapes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.drawShapesOnPDF = async (req, res) => {
    try {
        const { pdfId, shapes, pageNumber, scaleFactor } = req.body;

        const pdfRecord = await PDF.findOne({ pdfId });
        if (!pdfRecord) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        const pdfDoc = await PDFDocument.load(pdfRecord.fileData);
        const pages = pdfDoc.getPages();

        if (pageNumber < 1 || pageNumber > pages.length) {
            return res.status(400).json({ message: 'Invalid page number' });
        }

        const page = pages[pageNumber - 1];
        const { width, height } = page.getSize();

        shapes.forEach(shape => {
            const originalX = shape.x / scaleFactor;
            const originalY = height - (shape.y / scaleFactor) - (shape.height / scaleFactor);

            if (shape.type === 'rectangle') {
                page.drawRectangle({
                    x: originalX,
                    y: originalY,
                    width: shape.width / scaleFactor,
                    height: shape.height / scaleFactor,
                    borderColor: rgb(1, 0, 0),
                    borderWidth: 2,
                });
            }
        });

        const modifiedPdfBytes = await pdfDoc.save();
        pdfRecord.fileData = Buffer.from(modifiedPdfBytes);
        await pdfRecord.save();

        res.status(200).json({ message: 'Shapes embedded successfully', pdfId });
    } catch (error) {
        console.error('Error embedding shapes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




exports.embedShapesInPDF = async (req, res) => {
    try {
        const { pdfId, shapes, pageNumber, scaleFactor } = req.body;
        if (!pdfId || !shapes || shapes.length === 0) {
            return res.status(400).json({ message: 'Invalid request. Missing pdfId or shapes.' });
        }

        // Fetch the PDF to get fileHash
        const pdf = await PDF.findOne({ pdfId });
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found.' });
        }

        // Ensure fileHash is included when embedding
        console.log("Embedding shapes in PDF:", pdfId, "on page", pageNumber);

        await Shape.findOneAndUpdate(
            { pdfId, pageNumber },
            { shapes },
            { upsert: true, new: true }
        );

        return res.status(200).json({ message: "✅ Shapes embedded successfully!" });
    } catch (error) {
        console.error("❌ Error embedding shapes:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};





exports.saveShapes = async (req, res) => {
    try {
        const { pdfId, pageNumber, shapes } = req.body;
        let shapeRecord = await Shape.findOne({ pdfId, pageNumber });
        if (shapeRecord) {
            shapeRecord.shapes = shapes; // Overwrite existing shapes
        } else {
            shapeRecord = new Shape({ pdfId, pageNumber, shapes });
        }
        await shapeRecord.save();
        res.status(200).json({ message: 'Shapes saved successfully' });
    } catch (error) {
        console.error('Error saving shapes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};