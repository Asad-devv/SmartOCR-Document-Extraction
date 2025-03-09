import * as pdfjsLib from 'pdfjs-dist';

export const renderBasePdf = async (
  selectedPdfId,
  pdfFiles,
  currentPage,
  pdfContainerRef,
  baseCanvasRef,
  canvasRef,
  setTotalPages,
  setPdfDimensions,
  setPdfScale
) => {
  if (!selectedPdfId || !pdfFiles.length) return;
  const selectedPdf = pdfFiles.find((pdf) => pdf.id === selectedPdfId);
  if (!selectedPdf) return;

  const response = await fetch(selectedPdf.url);
  const pdfData = await response.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  setTotalPages(pdf.numPages);
  const page = await pdf.getPage(currentPage);

  const viewport = page.getViewport({ scale: 1.0 });
  const pdfWidth = viewport.width;
  const pdfHeight = viewport.height;
  setPdfDimensions({ width: pdfWidth, height: pdfHeight });

  const containerWidth = pdfContainerRef.current.offsetWidth - 8 || 800;
  const scale = containerWidth / pdfWidth;
  setPdfScale(scale);

  const baseCanvas = baseCanvasRef.current;
  baseCanvas.width = pdfWidth * scale;
  baseCanvas.height = pdfHeight * scale;
  const baseContext = baseCanvas.getContext('2d');
  const scaledViewport = page.getViewport({ scale });

  baseContext.fillStyle = '#e5e7eb';
  baseContext.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
  baseContext.shadowColor = 'rgba(0, 0, 0, 0.2)';
  baseContext.shadowBlur = 10;
  baseContext.shadowOffsetX = 2;
  baseContext.shadowOffsetY = 2;
  baseContext.fillStyle = '#ffffff';
  baseContext.fillRect(4, 4, baseCanvas.width - 8, baseCanvas.height - 8);
  baseContext.shadowBlur = 0;
  baseContext.shadowOffsetX = 0;
  baseContext.shadowOffsetY = 0;

  await page.render({ canvasContext: baseContext, viewport: scaledViewport }).promise;

  const overlayCanvas = canvasRef.current;
  overlayCanvas.width = pdfWidth * scale;
  overlayCanvas.height = pdfHeight * scale;
};