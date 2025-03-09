export const drawShapes = (context, scale, shapes, newShape) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clear once
  shapes.forEach((shape) => {
    if (shape.type === 'rectangle') { // Removed page check since we filter earlier
      context.strokeStyle = 'red';
      context.lineWidth = 2 / scale;
      context.strokeRect(shape.x * scale, shape.y * scale, shape.width * scale, shape.height * scale);
    }
  });
  if (newShape && newShape.type === 'rectangle') {
    context.strokeStyle = 'red';
    context.lineWidth = 2 / scale;
    context.strokeRect(newShape.x * scale, newShape.y * scale, newShape.width * scale, newShape.height * scale);
  }
};

export const setupShapeDrawing = (canvasRef, pdfScale, shapes, newShape, currentPage) => {
  if (!canvasRef.current || !pdfScale) return;

  const overlayCanvas = canvasRef.current;
  const overlayContext = overlayCanvas.getContext('2d');
  const filteredShapes = shapes.filter((shape) => shape.page === currentPage - 1);
  drawShapes(overlayContext, pdfScale, filteredShapes, newShape);
};