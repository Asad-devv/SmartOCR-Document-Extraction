const mongoose = require('mongoose');

const shapeSchema = new mongoose.Schema({
    pdfId: String,  
    shapes: [
        {
            type: { type: String },  
            coords: {
                x: Number,
                y: Number,
                width: Number,
                height: Number,
                radius: { type: Number, default: null },  
                points: { type: [Number], default: null } 
            }
        }
    ]
});

const Shape = mongoose.model('Shape', shapeSchema);

module.exports = Shape;
