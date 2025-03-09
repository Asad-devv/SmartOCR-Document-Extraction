import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Shapes } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { RenderJson } from './prompt';
import { initializePdfjs } from './TriggerUtils/initializePdfjs';
import { refreshTemplates, saveTemplate, applyTemplate } from './TriggerUtils/templateUtils';
import { renderBasePdf } from './TriggerUtils/pdfRendering';
import { drawShapes, setupShapeDrawing } from './TriggerUtils/shapeDrawing';
import { processAllPdfs, handleClosePreview } from './TriggerUtils/pdfProcessing';
import { handleFileChange, handleDrop, handleDrag } from './TriggerUtils/fileHandling';
import { toggleDrawing, handleMouseDown, handleMouseMove, handleMouseUp, applyShapesToAll } from './TriggerUtils/drawingControls';
import { handlePageChange } from './TriggerUtils/pageControls';

const Trigger = () => {
  const [dragActive, setDragActive] = useState(false);
  const [jsonResponses, setJsonResponses] = useState({});
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState(null);
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
  const [previewImages, setPreviewImages] = useState([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 612, height: 792 });
  const baseCanvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initializePdfjs();
  }, []);

  useEffect(() => {
    refreshTemplates(setTemplates);
  }, []);

  // Render base PDF only when selectedPdfId or currentPage changes
  useEffect(() => {
    renderBasePdf(
      selectedPdfId,
      pdfFiles,
      currentPage,
      pdfContainerRef,
      baseCanvasRef,
      canvasRef,
      setTotalPages,
      setPdfDimensions,
      setPdfScale
    );
  }, [selectedPdfId, currentPage]); // Removed pdfFiles from dependencies to prevent refresh on shape update

  // Redraw shapes whenever pdfFiles, selectedPdfId, newShape, or pdfScale changes
  useEffect(() => {
    const selectedPdf = pdfFiles.find((pdf) => pdf.id === selectedPdfId);
    const shapes = selectedPdf ? selectedPdf.shapes || [] : [];
    setupShapeDrawing(canvasRef, pdfScale, shapes, newShape, currentPage);
  }, [pdfFiles, selectedPdfId, newShape, pdfScale]);

  // JSX remains unchanged except for function calls
  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <input
          type="file"
          multiple
          onChange={(e) => handleFileChange(e, setPdfFiles, setSelectedPdfId)}
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
          onDragEnter={(e) => handleDrag(e, setDragActive)}
          onDragLeave={(e) => handleDrag(e, setDragActive)}
          onDragOver={(e) => handleDrag(e, setDragActive)}
          onDrop={(e) => handleDrop(e, setDragActive, handleFileChange)}
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
          onClick={() => toggleDrawing(setIsDrawingEnabled)}
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
          onClick={() => applyShapesToAll(pdfFiles, selectedPdfId, setPdfFiles)}
          className="bg-yellow-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Apply to All PDFs
        </motion.button>
        <motion.button
          onClick={() => processAllPdfs(
            pdfFiles,
            currentPage,
            setIsProcessing,
            setPreviewImages,
            setJsonResponses,
            setIsPreviewModalOpen
          )}
          className="bg-purple-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Process All PDFs'}
        </motion.button>
        {isProcessing && (
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
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Processing</h2>
              <p className="text-gray-600">Please wait while we process your files...</p>
              <div className="mt-4 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-t-purple-500 border-gray-200 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
        <select
          onChange={(e) => applyTemplate(e.target.value, pdfFiles, currentPage, setPdfFiles, uuidv4)}
          className="bg-blue-500 text-white p-2 rounded border-none outline-none"
        >
          <option value="">Apply Template</option>
          {templates.map((template) => (
            <option key={template._id} value={template._id}>{template.templateName}</option>
          ))}
        </select>
        <div className="relative">
          <select
            value={currentPage}
            onChange={(e) => handlePageChange(e, totalPages, setCurrentPage)}
            className="bg-green-500 text-white p-2 rounded border-none outline-none"
          >
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>Page {page}</option>
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
            {pdfFiles.map((pdf) => (
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
                  onMouseDown={(e) => handleMouseDown(
                    e,
                    isDrawingEnabled,
                    canvasRef,
                    pdfScale,
                    currentPage,
                    setNewShape,
                    setIsDrawing
                  )}
                  onMouseMove={(e) => handleMouseMove(
                    e,
                    isDrawing,
                    canvasRef,
                    pdfScale,
                    newShape,
                    setNewShape,
                    drawShapes,
                    pdfFiles,
                    selectedPdfId
                  )}
                  onMouseUp={() => handleMouseUp(
                    isDrawing,
                    newShape,
                    pdfFiles,
                    selectedPdfId,
                    setPdfFiles,
                    setIsDrawing,
                    setNewShape
                  )}
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
            <form onSubmit={(e) => saveTemplate(
              e,
              pdfFiles.find((pdf) => pdf.id === selectedPdfId)?.shapes || [],
              templateName,
              templateDescription,
              currentPage,
              setIsModalOpen,
              setTemplateName,
              setTemplateDescription,
              refreshTemplates
            )} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
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
            {previewImages.map((img) => (
              <div key={img.pdfId} className="mb-6">
                <h3 className="text-lg font-medium">{pdfFiles.find((pdf) => pdf.id === img.pdfId)?.file.name}</h3>
                <div className="flex justify-between gap-4 items-start">
                  <img src={img.url} alt={`Preview of ${img.pdfId}`} className="rounded shadow max-w-full max-h-[50vh] object-contain" />
                  <RenderJson data={jsonResponses[img.pdfId]} />
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <motion.button
                onClick={() => handleClosePreview(previewImages, setIsPreviewModalOpen, setPreviewImages)}
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