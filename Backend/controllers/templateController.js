const Template = require('../models/Template');

exports.saveTemplate = async (req, res) => {
  const { templateName, description, pdfId, pageNumber, shapes } = req.body;

  try {
    if (!templateName || !description || !pdfId || !pageNumber || !shapes) {
      return res.status(400).json({ message: 'templateName, description, pdfId, pageNumber, and shapes are required' });
    }

    const newTemplate = new Template({ templateName, description, pdfId, pageNumber, shapes });
    const savedTemplate = await newTemplate.save();

    return res.status(201).json(savedTemplate); 
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
  const { templateId, pdfId, pageNumber } = req.body;

  try {
    
    if (!templateId || templateId === "") {
      return res.status(400).json({ message: 'Template ID is required' });
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const adjustedTemplate = {
      ...template.toObject(),
      pageNumber,
      shapes: template.shapes.map(shape => ({
        type: shape.type,
        coords: shape.coords,
      })),
    };

    return res.status(200).json({ message: 'Template retrieved', template: adjustedTemplate });
  } catch (error) {
    console.error("Apply Template error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};