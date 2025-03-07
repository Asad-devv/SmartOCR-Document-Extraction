import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, Shapes } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import processImageWithPrompt from './prompt';
import { RenderJson } from './prompt';

const Trigger = () => {
  const [dragActive, setDragActive] = useState(false);
  const [jsonResponse, setJsonResponse] = useState();

  const [files, setFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
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
  const [pdfId, setPdfId] = useState(null);
  const [allShapes, setAllShapes] = useState({});
  const [pdfScale, setPdfScale] = useState(1.0);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 612, height: 792 });
  const pdfPageRef = useRef(null);
  const pdfDocRef = useRef(null);
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
    const fetchPdfs = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/pdf/list');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setPdfs(data.map(pdf => ({
          pdfId: pdf.pdfId,
          url: `http://localhost:4000/api/pdf/fetch/${pdf.pdfId}`,
          shapes: [],
        })));
      } catch (error) {
        console.error('Error fetching PDFs:', error);
        // Optionally set a default state or notify the user
        setPdfs([]); // Fallback to empty array
      }
    };
    fetchPdfs();
    refreshTemplates();
  }, [pdfId]); // Refetch when pdfId changes

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
    const renderBasePdf = async () => {
      if (!pdfFile || !baseCanvasRef.current) return;

      const response = await fetch(pdfFile);
      const pdfData = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      const page = await pdf.getPage(currentPage);
      pdfPageRef.current = page;

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
  }, [pdfFile, currentPage]);
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

  const sendPageToModel = async () => {
    if (!pdfFile) {
      console.error("No PDF file selected");
      return;
    }

    const response = await fetch(pdfFile);
    const pdfBlob = await response.blob();
    if (!pdfBlob || pdfBlob.size === 0) {
      console.error("Invalid or empty PDF blob");
      return;
    }

    const filteredShapes = shapes.filter((shape) => shape.page === currentPage - 1);
    if (!filteredShapes.length || !currentPage || currentPage < 1) {
      console.error("Invalid page number or no shapes to process");
      return;
    }

    console.log("Shapes before sending:", filteredShapes); // Debug log

    const formData = new FormData();
    formData.append("pdf", pdfBlob, "temp.pdf");
    formData.append("pageNumber", currentPage);
    formData.append("shapes", JSON.stringify(filteredShapes));

    try {
      const processResponse = await fetch("http://localhost:4000/api/shape/process-page", {
        method: "POST",
        body: formData,
      });
      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        console.error("Failed to process page:", errorText);
        alert("Failed to process page: " + errorText);
        return;
      }
      const imageBlob = await processResponse.blob();
      console.log("Received image blob:", imageBlob);
      setPreviewImage(URL.createObjectURL(imageBlob));
      setIsPreviewModalOpen(true);
      console.log("Sending PDF blob and shapes:", {
        pdfBlobSize: pdfBlob.size,
        pageNumber: currentPage,
        shapes: filteredShapes,
      });
      const res = await processImageWithPrompt(imageBlob, ` extract text in this image that are the in the red squares/rectangle only extract from red color shapes nothing else and I dont need rectangle response return 
          json response, only return json nothing else and also dont include anything extra that is not in the image give strict response
           format {"box1":"","box2":"",//other boxes data } and for new lines just separate by space no symbbole`)
      res && setJsonResponse(res)
    } catch (error) {
      console.error("Error processing page:", error);
      alert("Error processing page: " + error.message);
    }
  };
  const handleClosePreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setIsPreviewModalOpen(false);
    setPreviewImage(null);
  };
  const selectPdf = (pdf) => {
    setPdfFile(pdf.url);
    setPdfId(pdf.pdfId);
    setShapes(allShapes[pdf.pdfId]?.[currentPage - 1] || []);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    const url = URL.createObjectURL(file);
    setPdfFile(url);
    setPdfId(uuidv4()); // Local ID for this session
    setShapes([]);
  };


  const applyTemplate = async (templateId) => {
    if (!pdfFile || !templateId) return;

    const response = await fetch(pdfFile);
    const pdfBlob = await response.blob();
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "temp.pdf");
    formData.append("templateId", templateId);
    formData.append("pageNumber", currentPage);

    try {
      const applyResponse = await fetch("http://localhost:4000/api/template/apply", {
        method: "POST",
        body: formData,
      });
      if (!applyResponse.ok) {
        const errorText = await applyResponse.text();
        console.error("Failed to apply template:", errorText);
        alert("Failed to apply template: " + errorText);
        return;
      }

      const data = await applyResponse.json();
      console.log("Template response:", data); // Debug log

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
    } catch (error) {
      console.error("Error applying template:", error);
      alert("Error applying template: " + error.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = [...e.dataTransfer.files];
    setFiles(droppedFiles);
    const pdfFile = droppedFiles.find(file => file.type === 'application/pdf');
    if (pdfFile) handleFileChange({ target: { files: [pdfFile] } });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
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
    setAllShapes((prev) => ({
      ...prev,
      [pdfId]: { ...prev[pdfId], [currentPage - 1]: updatedShapes },
    }));
    setIsDrawing(false);
    setNewShape(null);

  };
  const handlePageChange = (e) => {
    const pageNum = parseInt(e.target.value);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setShapes(allShapes[pdfId]?.[pageNum - 1] || []);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 lg:pt-0 pt-[34%] bg-gray-100">
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
            <span className="font-semibold">Upload a file</span>
            <span className="text-green-100 ml-2">PDF</span>
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
            <p className="text-lg text-gray-600">or drag and drop here</p>
          </motion.div>
        </motion.label>
      </motion.div>

      <div className="flex space-x-4 mt-4 sticky top-0 z-10 bg-white p-4 rounded-lg shadow-md w-full  max-w-5xl mx-auto h-20">
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
          onClick={sendPageToModel}
          className="bg-purple-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Process Page
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
            className="bg-green-500 text-white p-2 mt-2 rounded border-none outline-none"
          >
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
          </select>
          <span className="absolute -top-4 left-0 text-md text-black font-thin">
            {pdfFile ? `Page: ${currentPage} of ${totalPages}` : 'Page No'}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-gray-200/30 shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                  <motion.button
                    onClick={() => removeFile(index)}
                    className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {pdfFile && (
        <div className="relative mt-6 p-4 rounded-lg">
          <div ref={pdfContainerRef} className="relative">
            <canvas ref={baseCanvasRef} style={{ position: 'absolute', top: 0, left: 0 }} /> {/* Base layer */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ cursor: isDrawingEnabled ? 'crosshair' : 'default', position: 'absolute', top: 0, left: 0 }}
            /> {/* Overlay layer */}
          </div>
        </div>
      )}

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
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add a name and description for your template</h2>
            <form onSubmit={saveTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue transition-all duration-200"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={templateDescription}
                  onChange={e => setTemplateDescription(e.target.value)}
                  rows="4"
                  className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue transition-all duration-200"
                  placeholder="Enter template description"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-themeBlue to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Preview Image</h2>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 w-full flex flex-col  max-w-4xl mx-4 shadow-2xl border border-gray-200/30"
          >
            <div className='flex justify-betweeen gap-4 items-center'>
            <img src={previewImage} alt="Preview of processed page" className=" rounded shadow max-w-full max-h-[70vh] object-contain" />
            <RenderJson data={jsonResponse} />
            </div>
            <div className="flex justify-end mt-4">
              <motion.button
                onClick={handleClosePreview}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
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