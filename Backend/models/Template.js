// models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    templateName: { type: String, required: true },
    description: { type: String, required: true },
    pdfId: { type: String, required: true },
    pageNumber: { type: Number, required: true }, 
    shapes: [{
        type: { type: String },
        fieldName: { type: String, required: true }, 
        coords: {
            x: Number,
            y: Number,
            width: Number,
            height: Number,
            radius: { type: Number, default: null },
            points: { type: [Number], default: null }
        }
    }]
});

const Template = mongoose.model('Template', templateSchema);
module.exports = Template;