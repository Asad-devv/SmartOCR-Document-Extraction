export const refreshTemplates = async (setTemplates) => {
  const response = await fetch('http://localhost:4000/api/template/get');
  const data = await response.json();
  setTemplates(data);
};

export const saveTemplate = async (
  e,
  shapes,
  templateName,
  templateDescription,
  currentPage,
  setIsModalOpen,
  setTemplateName,
  setTemplateDescription,
  refreshTemplates
) => {
  e.preventDefault();
  if (!shapes.length) return;

  const shapesToSave = shapes.map((shape) => ({
    type: shape.type,
    coords: { x: shape.x, y: shape.y, width: shape.width, height: shape.height },
  }));

  try {
    const response = await fetch("http://localhost:4000/api/template/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateName,
        description: templateDescription,
        pageNumber: currentPage,
        shapes: shapesToSave,
      }),
    });
    if (response.ok) {
      refreshTemplates(setTemplates);
      setIsModalOpen(false);
      setTemplateName("");
      setTemplateDescription("");
    }
  } catch (error) {
    console.error("Error saving template:", error);
  }
};

export const applyTemplate = async (
  templateId,
  pdfFiles,
  currentPage,
  setPdfFiles,
  uuidv4
) => {
  if (!pdfFiles.length || !templateId) return;

  const response = await fetch("http://localhost:4000/api/template/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId, pageNumber: currentPage }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to apply template:", errorText);
    return;
  }

  const data = await response.json();
  const template = data.template || {};
  const appliedShapes = (template.shapes || []).map((shape) => ({
    id: uuidv4(),
    type: shape.type,
    x: shape.coords.x,
    y: shape.coords.y,
    width: shape.coords.width,
    height: shape.coords.height,
    page: currentPage - 1,
  }));

  setPdfFiles((prevPdfFiles) =>
    prevPdfFiles.map((pdf) => ({
      ...pdf,
      shapes: appliedShapes, // Apply to all PDFs (or adjust to selected PDF only if desired)
    }))
  );
};