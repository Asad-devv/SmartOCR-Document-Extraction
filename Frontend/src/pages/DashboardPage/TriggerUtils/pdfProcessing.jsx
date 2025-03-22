import processImageWithPrompt from "../prompt";
import * as pdfjsLib from "pdfjs-dist";
export const processAllPdfs = async (
  pdfFiles,
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
      // Use the original file Blob to get page count
      const pdfData = await pdf.file.arrayBuffer(); // Access the file directly
      const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const pageCount = pdfDoc.numPages;

      // Use the original file Blob for the backend
      const pdfBlob = pdf.file; // Direct reference to the uploaded file

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const filteredShapes = (pdf.shapes || []).filter(
          (shape) => shape.page === pageNum - 1
        );
        if (!filteredShapes.length) {
          console.warn(`No shapes defined for ${pdf.id} on page ${pageNum}`);
          continue;
        }

        const formData = new FormData();
        formData.append("pdf", pdfBlob, `${pdf.id}.pdf`);
        formData.append("pageNumber", pageNum);
        formData.append("shapes", JSON.stringify(filteredShapes));

        const processResponse = await fetch(
          "http://localhost:4000/api/shape/process-page",
          {
            method: "POST",
            body: formData,
          }
        );
        if (!processResponse.ok) {
          const errorText = await processResponse.text();
          console.error(
            `Failed to process ${pdf.id} page ${pageNum}:`,
            errorText
          );
          continue;
        }
        const imageBlob = await processResponse.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        const pageKey = `${pdf.id}_page_${pageNum}`;
        newPreviewImages.push({ pdfId: pdf.id, page: pageNum, url: imageUrl });

        const res = await processImageWithPrompt(
          imageBlob,
          `Extract text from the red rectangles in **structured JSON format**.`
        );
        newJsonResponses[pageKey] = res;
      }
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

// No changes needed for handleClosePreview

// No changes needed for handleClosePreview

// No changes needed for handleClosePreview

export const handleClosePreview = (
  previewImages,
  setIsPreviewModalOpen,
  setPreviewImages
) => {
  previewImages.forEach((img) => URL.revokeObjectURL(img.url));
  setIsPreviewModalOpen(false);
  setPreviewImages([]);
};
