const PDF = require('../models/Pdf');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const generateFileHash = (fileBuffer) => {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

exports.uploadPDF = async (req, res) => {
    try {
        const { originalname, buffer } = req.file; 

        if (!originalname || !buffer) {
            return res.status(400).json({ message: 'File is required' });
        }

        
        const fileHash = generateFileHash(buffer);

       
        const existingPDF = await PDF.findOne({ fileHash });

        if (existingPDF) {
            console.log("PDF already exists with ID:", existingPDF.pdfId);
            return res.status(200).json({ pdfId: existingPDF.pdfId });
        }

      
        const pdfId = uuidv4();
        const newPDF = new PDF({ pdfId, fileName: originalname, fileHash });
        await newPDF.save();

        console.log("New PDF uploaded with ID:", pdfId);
        return res.status(201).json({ pdfId });
    } catch (error) {
        console.error("Error uploading PDF:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};