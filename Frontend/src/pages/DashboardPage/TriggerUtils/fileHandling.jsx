import { v4 as uuidv4 } from 'uuid';

export const handleFileChange = (e, setPdfFiles, setSelectedPdfId) => {
  const files = Array.from(e.target.files).filter((file) => file.type === "application/pdf");
  if (!files.length) return;

  const newPdfFiles = files.map((file) => ({
    id: uuidv4(),
    url: URL.createObjectURL(file),
    file,
    shapes: [],
  }));
  setPdfFiles(newPdfFiles);
  setSelectedPdfId(newPdfFiles[0].id);
};

export const handleDrop = (e, setDragActive, handleFileChange) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  handleFileChange({ target: { files: e.dataTransfer.files } });
};

export const handleDrag = (e, setDragActive) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
  else if (e.type === 'dragleave') setDragActive(false);
};