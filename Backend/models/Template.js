const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({
  templateName: { type: String, required: true },
  description: { type: String, required: true },
  pageNumber: { type: Number, required: true },
  shapes: [
    {
      type: { type: String, required: true },
      coords: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
    },
  ],
});

module.exports = mongoose.model("Template", TemplateSchema);