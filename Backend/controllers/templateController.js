const Template = require('../models/Template');

exports.saveTemplate = async (req, res) => {
    const { templateName, description, pdfId, shapes } = req.body;

    try {
        if (!templateName || !description || !pdfId || !shapes) {
            return res.status(400).json({ message: 'templateName, description, pdfId, and shapes are required' });
        }

        const newTemplate = new Template({ templateName, description, pdfId, shapes });
        await newTemplate.save();

        return res.status(201).json({ message: 'Template saved successfully!' });
    } catch (error) {
        console.error("Save Template error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.find();
        return res.status(200).json(templates);
    } catch (error) {
        console.error("Get Templates error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};