// TRIGGER.JSX
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Shapes } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "react-router-dom";
import {
  handleFileChange,
  handleDrop,
  handleDrag,
} from "./TriggerUtils/fileHandling";
import {
  processAllPdfs,
  handleClosePreview,
} from "./TriggerUtils/pdfProcessing";
import { renderBasePdf } from "./TriggerUtils/pdfRendering";
import { setupShapeDrawing } from "./TriggerUtils/shapeDrawing";
import { handlePageChange } from "./TriggerUtils/pageControls";
import { RenderJson, exportConsolidatedDataToExcel } from "./prompt";
import {
  refreshTemplates,
  applyTemplate,
  applyTemplateToAllPages,
} from "./TriggerUtils/templateUtils";
import { initializePdfjs } from "./TriggerUtils/initializePdfjs";
const Trigger = () => {
  const [dragActive, setDragActive] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState(null);
  const [jsonResponses, setJsonResponses] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [isApplyingToAll, setIsApplyingToAll] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({
    width: 612,
    height: 792,
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const location = useLocation();
  const canvasRef = useRef(null);
  const baseCanvasRef = useRef(null);
  const pdfContainerRef = useRef(null);
  useEffect(() => {
    initializePdfjs();
  }, []);
  useEffect(() => {
    refreshTemplates(setTemplates);
  }, []);

  useEffect(() => {
    const { state } = location;
    if (state?.selectedTemplateId) {
      setSelectedTemplateId(state.selectedTemplateId);
      if (pdfFiles.length > 0) {
        applyTemplate(
          state.selectedTemplateId,
          pdfFiles,
          currentPage,
          setPdfFiles,
          uuidv4
        );
      }
    }
  }, [location, pdfFiles]);

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
  }, [selectedPdfId, currentPage]);

  useEffect(() => {
    const selectedPdf = pdfFiles.find((pdf) => pdf.id === selectedPdfId);
    const shapes = selectedPdf ? selectedPdf.shapes || [] : [];
    setupShapeDrawing(canvasRef, pdfScale, shapes, null, currentPage);
  }, [pdfFiles, selectedPdfId, pdfScale]);

  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    if (templateId && pdfFiles.length > 0) {
      applyTemplate(templateId, pdfFiles, currentPage, setPdfFiles, uuidv4);
    }
  };

  const handleApplyToAllPages = async () => {
    if (isApplyingToAll || !selectedTemplateId || !pdfFiles.length) return;
    setIsApplyingToAll(true);
    try {
      await applyTemplateToAllPages(
        selectedTemplateId,
        pdfFiles,
        setPdfFiles,
        uuidv4
      );
    } catch (error) {
      console.error("Error applying template to all pages:", error);
    } finally {
      setIsApplyingToAll(false);
    }
  };
  const handleProcessAllPdfs = async () => {
    if (isProcessing || !pdfFiles.length) return;
    await processAllPdfs(
      pdfFiles,
      setIsProcessing,
      setPreviewImages,
      setJsonResponses,
      setIsPreviewModalOpen
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
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
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer
            ${
              dragActive
                ? "border-green-500 bg-green-50/30"
                : "border-gray-300 bg-white/30"
            }
            backdrop-blur-md transition-all duration-300 hover:border-green-500 hover:bg-green-50/30`}
          onDragEnter={(e) => handleDrag(e, setDragActive)}
          onDragLeave={(e) => handleDrag(e, setDragActive)}
          onDragOver={(e) => handleDrag(e, setDragActive)}
          onDrop={(e) =>
            handleDrop(e, setDragActive, (e) =>
              handleFileChange(e, setPdfFiles, setSelectedPdfId)
            )
          }
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
            <p className="text-lg text-gray-600">
              or drag and drop multiple PDFs here
            </p>
          </motion.div>
        </motion.label>
      </motion.div>

      <div className="flex flex-wrap gap-2 mt-4 sticky top-0 z-0 bg-white p-4 rounded-lg shadow-md w-full lg:w-[65%] md:w-[65%]">
        <select
          value={selectedTemplateId}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="bg-blue-500 text-white p-2 rounded border-none outline-none"
        >
          <option value="">Select Template</option>
          {templates.map((template) => (
            <option key={template._id} value={template._id}>
              {template.templateName}
            </option>
          ))}
        </select>
        <motion.button
          onClick={handleApplyToAllPages}
          className="bg-blue-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isApplyingToAll || !selectedTemplateId || !pdfFiles.length}
        >
          {isApplyingToAll ? (
            <span className="flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-t-white border-gray-200 rounded-full mr-2"
              />
              Applying...
            </span>
          ) : (
            <>
              <Shapes className="w-5 h-5 mr-2" /> Apply to All Pages
            </>
          )}
        </motion.button>
        <motion.button
          onClick={handleProcessAllPdfs}
          className="bg-purple-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-t-white border-gray-200 rounded-full mr-2"
              />
              Processing...
            </span>
          ) : (
            "Process All PDFs"
          )}
        </motion.button>
        <select
          value={currentPage}
          onChange={(e) => handlePageChange(e, totalPages, setCurrentPage)}
          className="bg-green-500 text-white p-2 rounded border-none outline-none"
        >
          {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
            (page) => (
              <option key={page} value={page}>
                Page {page}
              </option>
            )
          )}
        </select>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-2">Uploaded PDFs</h3>
          <ul className="space-y-2">
            {pdfFiles.map((pdf) => (
              <li
                key={pdf.id}
                onClick={() => setSelectedPdfId(pdf.id)}
                className={`p-2 rounded cursor-pointer ${
                  selectedPdfId === pdf.id ? "bg-blue-100" : "bg-white"
                } hover:bg-blue-50`}
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
                <canvas
                  ref={baseCanvasRef}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Processing
            </h2>
            <p className="text-gray-600">
              Please wait while we process your files...
            </p>
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
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Preview Images
            </h2>
            {previewImages.map((img) => (
              <div key={`${img.pdfId}_page_${img.page}`} className="mb-6">
                <h3 className="text-lg font-medium">
                  {pdfFiles.find((pdf) => pdf.id === img.pdfId)?.file.name} -
                  Page {img.page}
                </h3>
                <div className="flex justify-between gap-4 items-start">
                  <img
                    src={img.url}
                    alt={`Preview of ${img.pdfId} page ${img.page}`}
                    className="rounded shadow max-w-full max-h-[50vh] object-contain"
                  />
                  <RenderJson
                    data={jsonResponses[`${img.pdfId}_page_${img.page}`]}
                    pdfId={img.pdfId}
                    allJsonResponses={jsonResponses}
                    setConsolidatedData={setConsolidatedData}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-4">
              <motion.button
                onClick={() => {
                  console.log("JSON Responses before export:", jsonResponses);
                  exportConsolidatedDataToExcel(jsonResponses, pdfFiles);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                disabled={!Object.keys(jsonResponses).length}
              >
                Download Excel
              </motion.button>
              <motion.button
                onClick={() =>
                  handleClosePreview(
                    previewImages,
                    setIsPreviewModalOpen,
                    setPreviewImages
                  )
                }
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
