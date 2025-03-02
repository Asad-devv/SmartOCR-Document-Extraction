// models/Pdf.js
const mongoose = require('mongoose');

const PdfSchema = new mongoose.Schema({
    pdfId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    fileData: { type: Buffer, required: true },
    contentType: { type: String, default: 'application/pdf' },
    fileHash: { type: String, required: true, unique: true } // Add this
});

module.exports = mongoose.model('Pdf', PdfSchema);