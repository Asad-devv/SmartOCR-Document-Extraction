// LOADTEMPLATE.JSX
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LucideFileUp, Shapes } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import * as pdfjsLib from "pdfjs-dist";
import {
  handleFileChange,
  handleDrop,
  handleDrag,
} from "./TriggerUtils/fileHandling";
import {
  toggleDrawing,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} from "./TriggerUtils/drawingControls";
import { renderBasePdf } from "./TriggerUtils/pdfRendering";
import { drawShapes, setupShapeDrawing } from "./TriggerUtils/shapeDrawing";
import { handlePageChange } from "./TriggerUtils/pageControls";

const Loadtemplate = () => {
  const [dragActive, setDragActive] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShape, setNewShape] = useState(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({
    width: 612,
    height: 792,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const canvasRef = useRef(null);
  const baseCanvasRef = useRef(null);
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  }, []);

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
    setupShapeDrawing(canvasRef, pdfScale, shapes, newShape, currentPage);
  }, [pdfFiles, selectedPdfId, newShape, pdfScale]);

  const saveTemplate = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const selectedPdf = pdfFiles.find((pdf) => pdf.id === selectedPdfId);
    if (!selectedPdf || !selectedPdf.shapes.length) return;

    setIsSaving(true);
    const shapesToSave = selectedPdf.shapes.map((shape) => ({
      type: shape.type,
      coords: {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
      },
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
        setIsModalOpen(false);
        setTemplateName("");
        setTemplateDescription("");
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 bg-gray-100"
    >
      <motion.div
        className="mb-6 bg-green-500 text-white p-4 rounded-xl shadow-lg text-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="font-semibold">Upload PDFs</span>
          <span className="text-green-100 ml-2">to Define Template</span>
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
        <input
          type="file"
          multiple
          onChange={(e) => handleFileChange(e, setPdfFiles, setSelectedPdfId)}
          className="hidden"
          id="file-upload"
          accept=".pdf"
        />
        <motion.div
          className="flex flex-col items-center justify-center pt-5 pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LucideFileUp className="w-12 h-12 mb-4 text-green-500" />
          <p className="text-lg text-gray-600">or drag and drop PDFs here</p>
        </motion.div>
      </motion.label>

      <div className="flex flex-wrap gap-2  mt-4 sticky top-0 z-0 bg-white p-4 rounded-lg shadow-md w-full lg:w-[45%] md:w-[45%] ">
        <motion.button
          onClick={() => toggleDrawing(setIsDrawingEnabled)}
          className={`p-2 rounded flex items-center ${
            isDrawingEnabled ? "bg-blue-700" : "bg-blue-500"
          } text-white`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shapes className="w-5 h-5 mr-2" />{" "}
          {isDrawingEnabled ? "Stop Drawing" : "Draw Rectangle"}
        </motion.button>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white p-2 rounded flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save Template
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
                  onMouseDown={(e) =>
                    handleMouseDown(
                      e,
                      isDrawingEnabled,
                      canvasRef,
                      pdfScale,
                      currentPage,
                      setNewShape,
                      setIsDrawing
                    )
                  }
                  onMouseMove={(e) =>
                    handleMouseMove(
                      e,
                      isDrawing,
                      canvasRef,
                      pdfScale,
                      newShape,
                      setNewShape,
                      drawShapes,
                      pdfFiles,
                      selectedPdfId
                    )
                  }
                  onMouseUp={() =>
                    handleMouseUp(
                      isDrawing,
                      newShape,
                      pdfFiles,
                      selectedPdfId,
                      setPdfFiles,
                      setIsDrawing,
                      setNewShape
                    )
                  }
                  style={{
                    cursor: isDrawingEnabled ? "crosshair" : "default",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
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
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Save Template
            </h2>
            <form onSubmit={saveTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template name"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  rows="4"
                  className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template description"
                  disabled={isSaving}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <motion.button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isSaving}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-t-white border-gray-200 rounded-full mr-2"
                      />
                      Saving...
                    </span>
                  ) : (
                    "Save Template"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Loadtemplate;
