const PDF = require("../models/Pdf");
const { v4: uuidv4 } = require("uuid");
const crypto = require('crypto');


exports.uploadPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { originalname, buffer } = req.file;
        const fileHash = crypto.createHash('md5').update(buffer).digest('hex'); // Compute hash

        // Check if PDF with this hash already exists
        let existingPDF = await PDF.findOne({ fileHash });
        if (existingPDF) {
            console.log("✅ PDF already exists with pdfId:", existingPDF.pdfId);
            return res.status(200).json({ message: 'PDF already exists', pdfId: existingPDF.pdfId });
        }

        // If not, create a new PDF entry
        const pdfId = uuidv4();
        const uniqueFileName = `${pdfId}_${originalname}`;

        const newPDF = new PDF({
            pdfId,
            fileName: uniqueFileName,
            fileData: buffer,
            contentType: 'application/pdf',
            fileHash
        });

        await newPDF.save();
        console.log("✅ PDF uploaded with pdfId:", pdfId);
        res.status(201).json({ message: 'PDF saved!', pdfId });
    } catch (error) {
        console.error('Error uploading PDF:', error.stack);
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

exports.listPDFs = async (req, res) => {
    try {
        const pdfs = await PDF.find({}, 'pdfId fileName fileHash');
        res.status(200).json(pdfs);
    } catch (error) {
        console.error('Error listing PDFs:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

