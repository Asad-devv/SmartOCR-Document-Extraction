const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    pdfId: { type: String, required: true, unique: true }, 
    fileName: { type: String, required: true }, 
    fileHash: { type: String, required: true, unique: true },
    uploadedAt: { type: Date, default: Date.now },
});

const PDF = mongoose.model('PDF', pdfSchema);

module.exports = PDF;