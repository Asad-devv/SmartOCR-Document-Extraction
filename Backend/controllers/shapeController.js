const Shape = require('../models/Shape');

exports.saveShapes = async (req, res) => {
    const { pdfId, pageNumber, shapes } = req.body;

    try {
        if (!pdfId || pageNumber === undefined || !shapes) {
            return res.status(400).json({ message: 'pdfId, pageNumber, and shapes are required' });
        }

      
        if (!Array.isArray(shapes)) {
            return res.status(400).json({ message: 'shapes must be an array' });
        }

     
        const transformedShapes = shapes.map(shape => ({
            type: shape.type,
            coords: {
                x: shape.coords.x,
                y: shape.coords.y,
                width: shape.coords.width,
                height: shape.coords.height,
                radius: shape.coords.radius,
                points: shape.coords.points
            }
        }));

      
        await Shape.findOneAndUpdate(
            { pdfId, pageNumber },
            { shapes: transformedShapes },
            { upsert: true, new: true }
        );

        return res.status(201).json({ message: 'Shapes saved successfully!' });
    } catch (error) {
        console.error("Save Shapes error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getShapes = async (req, res) => {
    const { pdfId, pageNumber } = req.params;
    
    try {
        const shapesDoc = await Shape.findOne({ 
            pdfId, 
            pageNumber: Number(pageNumber) 
        });

        if (!shapesDoc) {
            return res.status(200).json({ shapes: [] });
        }

        const transformedShapes = shapesDoc.shapes.map(shape => ({
            id: Date.now() + Math.random(),
            type: shape.type,
            x: shape.coords.x,
            y: shape.coords.y,
            width: shape.coords.width,
            height: shape.coords.height,
            radius: shape.coords.radius,
            points: shape.coords.points,
            page: Number(pageNumber)
        }));

        return res.status(200).json({ shapes: transformedShapes });
    } catch (error) {
        console.error("Get Shapes error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};