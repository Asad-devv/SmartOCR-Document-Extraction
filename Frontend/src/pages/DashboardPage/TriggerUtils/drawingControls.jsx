export const toggleDrawing = (setIsDrawingEnabled) => {
  setIsDrawingEnabled((prev) => !prev);
};

export const handleMouseDown = (
  e,
  isDrawingEnabled,
  canvasRef,
  pdfScale,
  currentPage,
  setNewShape,
  setIsDrawing
) => {
  if (!isDrawingEnabled || !canvasRef.current) return;
  const rect = canvasRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left) / pdfScale;
  const y = (e.clientY - rect.top) / pdfScale;
  setNewShape({
    id: Date.now(),
    type: 'rectangle',
    x,
    y,
    width: 0,
    height: 0,
    page: currentPage - 1,
  });
  setIsDrawing(true);
};

export const handleMouseMove = (
  e,
  isDrawing,
  canvasRef,
  pdfScale,
  newShape,
  setNewShape,
  drawShapes,
  pdfFiles,
  selectedPdfId
) => {
  if (!isDrawing || !canvasRef.current || !newShape) return;
  const rect = canvasRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left) / pdfScale;
  const y = (e.clientY - rect.top) / pdfScale;
  setNewShape((prev) => ({
    ...prev,
    width: x - prev.x,
    height: y - prev.y,
  }));

  const overlayContext = canvasRef.current.getContext('2d');
  const selectedPdf = pdfFiles.find((pdf) => pdf.id === selectedPdfId);
  const existingShapes = selectedPdf ? selectedPdf.shapes || [] : [];
  drawShapes(overlayContext, pdfScale, existingShapes, newShape); // Draw all shapes
};

export const handleMouseUp = (
  isDrawing,
  newShape,
  pdfFiles,
  selectedPdfId,
  setPdfFiles,
  setIsDrawing,
  setNewShape
) => {
  if (!isDrawing || !newShape) return;
  setPdfFiles((prevPdfFiles) =>
    prevPdfFiles.map((pdf) =>
      pdf.id === selectedPdfId
        ? { ...pdf, shapes: [...(pdf.shapes || []), newShape] }
        : pdf
    )
  );
  setIsDrawing(false);
  setNewShape(null);
};

export const applyShapesToAll = (pdfFiles, selectedPdfId, setPdfFiles) => {
  const selectedPdf = pdfFiles.find((pdf) => pdf.id === selectedPdfId);
  if (!selectedPdf || !selectedPdf.shapes.length) {
    alert("No shapes to apply");
    return;
  }

  setPdfFiles((prevPdfFiles) =>
    prevPdfFiles.map((pdf) => ({
      ...pdf,
      shapes: [...selectedPdf.shapes],
    }))
  );
};