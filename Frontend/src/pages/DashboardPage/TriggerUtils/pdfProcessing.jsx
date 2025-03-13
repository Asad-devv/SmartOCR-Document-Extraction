import processImageWithPrompt from '../prompt';

export const processAllPdfs = async (
  pdfFiles,
  currentPage,
  setIsProcessing,
  setPreviewImages,
  setJsonResponses,
  setIsPreviewModalOpen
) => {
  if (!pdfFiles.length) {
    alert("No PDFs uploaded");
    return;
  }

  setIsProcessing(true);
  const newPreviewImages = [];
  const newJsonResponses = {};

  try {
    for (const pdf of pdfFiles) {
      const filteredShapes = (pdf.shapes || []).filter((shape) => shape.page === currentPage - 1);
      if (!filteredShapes.length) {
        console.warn(`No shapes defined for ${pdf.id} on page ${currentPage}`);
        continue;
      }

      const response = await fetch(pdf.url);
      const pdfBlob = await response.blob();

      const formData = new FormData();
      formData.append("pdf", pdfBlob, `${pdf.id}.pdf`);
      formData.append("pageNumber", currentPage);
      formData.append("shapes", JSON.stringify(filteredShapes));

      const processResponse = await fetch("http://localhost:4000/api/shape/process-page", {
        method: "POST",
        body: formData,
      });
      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        console.error(`Failed to process ${pdf.id}:`, errorText);
        continue;
      }
      const imageBlob = await processResponse.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      newPreviewImages.push({ pdfId: pdf.id, url: imageUrl });

      const res = await processImageWithPrompt(
        imageBlob,
        `Extract text from the red rectangles in **structured JSON format**.
        `
      );
      newJsonResponses[pdf.id] = res;
    }

    setPreviewImages(newPreviewImages);
    setJsonResponses(newJsonResponses);
    setIsPreviewModalOpen(true);
  } catch (error) {
    console.error("Error during processing:", error);
  } finally {
    setIsProcessing(false);
  }
};

export const handleClosePreview = (previewImages, setIsPreviewModalOpen, setPreviewImages) => {
  previewImages.forEach((img) => URL.revokeObjectURL(img.url));
  setIsPreviewModalOpen(false);
  setPreviewImages([]);
};