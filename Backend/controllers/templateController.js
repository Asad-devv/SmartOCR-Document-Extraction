const Template = require("../models/Template");

exports.saveTemplate = async (req, res) => {
  const { templateName, description, pageNumber, shapes } = req.body;

  try {
    if (!templateName || !description || !pageNumber || !shapes) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure shapes is an array (in case it’s sent as a string or object)
    let parsedShapes = Array.isArray(shapes) ? shapes : [];
    if (typeof shapes === "string") {
      try {
        parsedShapes = JSON.parse(shapes);
      } catch (error) {
        return res.status(400).json({ message: "Invalid shapes data: not a valid JSON array" });
      }
    }

    const newTemplate = new Template({
      templateName,
      description,
      pageNumber,
      shapes: parsedShapes,
    });
    const savedTemplate = await newTemplate.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    console.error("Save Template error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.status(200).json(templates);
  } catch (error) {
    console.error("Get Templates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.applyTemplate = async (req, res) => {
  const { templateId, pageNumber } = req.body;

  try {
    if (!templateId) {
      return res.status(400).json({ message: "Template ID is required" });
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    console.log("Template retrieved:", template);

    const adjustedTemplate = {
      ...template.toObject(),
      pageNumber,
      shapes: template.shapes || [], // Default to empty array if shapes is undefined
    };

    res.status(200).json({ message: "Template retrieved", template: adjustedTemplate });
  } catch (error) {
    console.error("Apply Template error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};