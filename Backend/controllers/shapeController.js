const Shape = require('../models/Shape');
const { PDFDocument, rgb } = require('pdf-lib'); 
const fs = require('fs');
const PDF = require('../models/Pdf');


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
        const { pdfId, shapes, pageNumber } = req.body;

        if (!pdfId || !shapes || pageNumber === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const pdfRecord = await PDF.findOne({ pdfId });
        if (!pdfRecord || !pdfRecord.fileData) {
            return res.status(404).json({ message: "PDF not found" });
        }

        const pdfDoc = await PDFDocument.load(pdfRecord.fileData);
        const pages = pdfDoc.getPages();

        if (pageNumber < 1 || pageNumber > pages.length) {
            return res.status(400).json({ message: "Invalid page number" });
        }

        const page = pages[pageNumber - 1];

        // Draw shapes on the PDF
        shapes.forEach(shape => {
            if (shape.type === 'rectangle') {
                page.drawRectangle({
                    x: shape.x,
                    y: shape.y,
                    width: shape.width,
                    height: shape.height,
                    borderColor: rgb(1, 0, 0),
                    borderWidth: 2,
                });
            }
        });

        const modifiedPdfBytes = await pdfDoc.save();
        pdfRecord.fileData = Buffer.from(modifiedPdfBytes); 
        await pdfRecord.save();

        console.log(` Shapes embedded successfully in PDF: ${pdfId}`);
        res.status(200).json({ message: "Shapes embedded successfully", pdfId });

    } catch (error) {
        console.error(" Error embedding shapes:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





