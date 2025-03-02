// controllers/templateController.js
const Template = require('../models/Template');

exports.saveTemplate = async (req, res) => {
    const { templateName, description, pdfId, pageNumber, shapes } = req.body;

    try {
        if (!templateName || !description || !pdfId || !pageNumber || !shapes) {
            return res.status(400).json({ message: 'templateName, description, pdfId, pageNumber, and shapes are required' });
        }

        const newTemplate = new Template({ templateName, description, pdfId, pageNumber, shapes });
        await newTemplate.save();

        return res.status(201).json({ message: 'Template saved successfully!', templateId: newTemplate._id });
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

exports.applyTemplate = async (req, res) => {
    const { templateId, pdfId } = req.body;
    try {
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

       
        return res.status(200).json({ message: 'Template retrieved', template });
    } catch (error) {
        console.error("Apply Template error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};