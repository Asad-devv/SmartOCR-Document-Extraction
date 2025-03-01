
const PDF = require("../models/Pdf");
const { v4: uuidv4 } = require("uuid");
exports.uploadPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { originalname, buffer } = req.file;

        // 🔍 Check if a PDF with the same filename already exists
        let existingPDF = await PDF.findOne({ fileName: originalname });

        if (existingPDF) {
            console.log("✅ PDF already exists. Returning existing pdfId:", existingPDF.pdfId);
            return res.status(200).json({ pdfId: existingPDF.pdfId });
        }

        const newPDF = new PDF({
            pdfId: uuidv4(),
            fileName: originalname,
            fileData: buffer,
            contentType: 'application/pdf',
        });

        await newPDF.save();
        res.status(201).json({ message: 'PDF saved!', pdfId: newPDF.pdfId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getPDF = async (req, res) => {
    try {
        const { pdfId } = req.params;

        const pdfRecord = await PDF.findOne({ pdfId });
        if (!pdfRecord) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        res.setHeader('Content-Type', pdfRecord.contentType);
        res.send(pdfRecord.fileData);
    } catch (error) {
        console.error('Error fetching PDF:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};