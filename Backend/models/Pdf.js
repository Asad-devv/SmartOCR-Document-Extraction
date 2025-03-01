const mongoose = require('mongoose');

const PdfSchema = new mongoose.Schema({
    pdfId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    fileData: { type: Buffer, required: true }, // Store the actual PDF as binary data
    contentType: { type: String, default: 'application/pdf' }
});

module.exports = mongoose.model('Pdf', PdfSchema);
