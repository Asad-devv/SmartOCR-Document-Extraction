import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, Shapes } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { v4 as uuidv4 } from 'uuid';
import processImageWithPrompt from './prompt';
import { RenderJson } from './prompt';

const Trigger = () => {
  const [dragActive, setDragActive] = useState(false);
  const [jsonResponses, setJsonResponses] = useState({});
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState(null);
  const [shapes, setShapes] = useState([]); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShape, setNewShape] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [previewImages, setPreviewImages] = useState([]); // Array of preview images
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 612, height: 792 });
  const baseCanvasRef = useRef(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  }, []);

  const refreshTemplates = async () => {
    const response = await fetch('http://localhost:4000/api/template/get');
    const data = await response.json();
    setTemplates(data);
  };

  useEffect(() => {
    refreshTemplates();
  }, []);

  const saveTemplate = async (e) => {
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
        refreshTemplates();
        setIsModalOpen(false);
        setTemplateName("");
        setTemplateDescription("");
      }
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  useEffect(() => {
    if (!selectedPdfId || !pdfFiles.length) return;
    const selectedPdf = pdfFiles.find(pdf => pdf.id === selectedPdfId);
    if (!selectedPdf) return;

    const renderBasePdf = async () => {
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

    renderBasePdf();
  }, [selectedPdfId, currentPage, pdfFiles]);

  useEffect(() => {
    if (!canvasRef.current || !pdfScale) return;

    const overlayCanvas = canvasRef.current;
    const overlayContext = overlayCanvas.getContext('2d');
    drawShapes(overlayContext, pdfScale);
  }, [shapes, newShape, pdfScale]);

  const drawShapes = (context, scale) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    shapes.forEach(shape => {
      if (shape.page === currentPage - 1 && shape.type === 'rectangle') {
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

  const processAllPdfs = async () => {
    if (!pdfFiles.length) {
      alert("No PDFs uploaded");
      return;
    }

    const filteredShapes = shapes.filter((shape) => shape.page === currentPage - 1);
    if (!filteredShapes.length) {
      alert("No shapes defined for the current page");
      return;
    }

    const newPreviewImages = [];
    const newJsonResponses = {};

    for (const pdf of pdfFiles) {
      const response = await fetch(pdf.url);
      const pdfBlob = await response.blob();

      const formData = new FormData();
      formData.append("pdf", pdfBlob, `${pdf.id}.pdf`);
      formData.append("pageNumber", currentPage);
      formData.append("shapes", JSON.stringify(filteredShapes));

      try {
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
          `extract text in this image that are in the red squares/rectangles only, extract from red color shapes nothing else and I dont need rectangle response return json response, only return json nothing else and also dont include anything extra that is not in the image give strict response format {"box1":"","box2":"",//other boxes data } and for new lines just separate by space no symbol`
        );
        newJsonResponses[pdf.id] = res;
      } catch (error) {
        console.error(`Error processing ${pdf.id}:`, error);
      }
    }

    setPreviewImages(newPreviewImages);
    setJsonResponses(newJsonResponses);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    previewImages.forEach(img => URL.revokeObjectURL(img.url));
    setIsPreviewModalOpen(false);
    setPreviewImages([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type === "application/pdf");
    if (!files.length) return;

    const newPdfFiles = files.map(file => ({
      id: uuidv4(),
      url: URL.createObjectURL(file),
      file,
    }));
    setPdfFiles(newPdfFiles);
    setSelectedPdfId(newPdfFiles[0].id); // Select the first PDF by default
    setShapes([]);
  };

  const applyTemplate = async (templateId) => {
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
    setShapes(appliedShapes);
  };

  const applyShapesToAll = () => {
    if (!shapes.length) {
      alert("No shapes to apply");
      return;
    }
    // Shapes are already shared across PDFs via state; just ensure UI reflects this
    pdfFiles.forEach(pdf => {
      // No need to store per PDF; shapes are global and applied to currentPage
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange({ target: { files: e.dataTransfer.files } });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const toggleDrawing = () => {
    setIsDrawingEnabled(!isDrawingEnabled);
  };

  const handleMouseDown = (e) => {
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

  const handleMouseMove = (e) => {
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
    drawShapes(overlayContext, pdfScale);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !newShape) return;
    const updatedShapes = [...shapes, newShape];
    setShapes(updatedShapes);
    setIsDrawing(false);
    setNewShape(null);
  };

  const handlePageChange = (e) => {
    const pageNum = parseInt(e.target.value);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          accept=".pdf"
        />
        <motion.div
          className="mb-6 bg-green-500 text-white p-4 rounded-xl shadow-lg text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="font-semibold">Upload PDFs</span>
            <span className="text-green-100 ml-2">Multiple PDFs</span>
          </label>
        </motion.div>
        <motion.label
          htmlFor="file-upload"
          className={`
            flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer
            ${dragActive ? 'border-green-500 bg-green-50/30' : 'border-gray-300 bg-white/30'}
            backdrop-blur-md transition-all duration-300 hover:border-green-500 hover:bg-green-50/30
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <motion.div
            className="flex flex-col items-center justify-center pt-5 pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Upload className="w-12 h-12 mb-4 text-green-500" />
            <p className="text-lg text-gray-600">or drag and drop multiple PDFs here</p>
          </motion.div>
        </motion.label>
      </motion.div>

      <div className="flex space-x-4 mt-4 sticky top-0 z-10 bg-white p-4 rounded-lg shadow-md w-full">
        <motion.button
          onClick={toggleDrawing}
          className={`p-2 rounded flex items-center ${isDrawingEnabled ? 'bg-blue-700' : 'bg-blue-500'} text-white`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shapes className="w-5 h-5 mr-2" /> {isDrawingEnabled ? 'Stop Drawing' : 'Draw Rectangle'}
        </motion.button>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save Template
        </motion.button>
        <motion.button
          onClick={applyShapesToAll}
          className="bg-yellow-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Apply to All PDFs
        </motion.button>
        <motion.button
          onClick={processAllPdfs}
          className="bg-purple-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Process All PDFs
        </motion.button>
        <select
          onChange={e => applyTemplate(e.target.value)}
          className="bg-blue-500 text-white p-2 rounded border-none outline-none"
        >
          <option value="">Apply Template</option>
          {templates.map(template => (
            <option key={template._id} value={template._id}>{template.templateName}</option>
          ))}
        </select>
        <div className="relative">
          <select
            value={currentPage}
            onChange={handlePageChange}
            className="bg-green-500 text-white p-2 rounded border-none outline-none"
          >
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
          </select>
          <span className="absolute -top-6 left-0 text-normal text-black font-thin">
            {selectedPdfId ? `Page: ${currentPage} of ${totalPages}` : 'Page No'}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-2">Uploaded PDFs</h3>
          <ul className="space-y-2">
            {pdfFiles.map(pdf => (
              <li
                key={pdf.id}
                onClick={() => setSelectedPdfId(pdf.id)}
                className={`p-2 rounded cursor-pointer ${selectedPdfId === pdf.id ? 'bg-blue-100' : 'bg-white'} hover:bg-blue-50`}
              >
                {pdf.file.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          {selectedPdfId && (
            <div className="relative p-4 rounded-lg">
              <div ref={pdfContainerRef} className="relative">
                <canvas ref={baseCanvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{ cursor: isDrawingEnabled ? 'crosshair' : 'default', position: 'absolute', top: 0, left: 0 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200/30"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Save Template</h2>
            <form onSubmit={saveTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={templateDescription}
                  onChange={e => setTemplateDescription(e.target.value)}
                  rows="4"
                  className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue"
                  placeholder="Enter template description"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <motion.button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-themeBlue to-blue-600 text-white rounded-lg"
                >
                  Save Template
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {isPreviewModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 w-full max-w-4xl mx-4 shadow-2xl border border-gray-200/30 overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Preview Images</h2>
            {previewImages.map((img, index) => (
              <div key={img.pdfId} className="mb-6">
                <h3 className="text-lg font-medium">{pdfFiles.find(pdf => pdf.id === img.pdfId)?.file.name}</h3>
                <div className="flex justify-between gap-4 items-start">
                  <img src={img.url} alt={`Preview of ${img.pdfId}`} className="rounded shadow max-w-full max-h-[50vh] object-contain" />
                  <RenderJson data={jsonResponses[img.pdfId]} />
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <motion.button
                onClick={handleClosePreview}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Trigger;