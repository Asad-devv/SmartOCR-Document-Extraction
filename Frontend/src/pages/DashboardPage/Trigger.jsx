import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, Shapes } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { Stage, Layer, Rect, Circle, Line } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import processImageWithPrompt from "./prompt"; // Adjust path
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
const Trigger = () => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [pdfFile, setPdfFile] = useState(null);
    const [shapes, setShapes] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newShape, setNewShape] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedShapeType, setSelectedShapeType] = useState(null);
    const [isToolboxOpen, setIsToolboxOpen] = useState(false);
    const [pdfPages, setPdfPages] = useState([]);
    let   [currentPage, setCurrentPage] = useState(1); 
    const stageRef = useRef(null);
    const [pdfId, setPdfId] = useState(null); 
    const [allShapes, setAllShapes] = useState({});
    const [pdfScale, setPdfScale] = useState(1.0);

    const sendPageToModel = async () => {
        if (!pdfFile) {
            console.error("No PDF file provided.");
            return;
        }
        
        try {
            const loadingTask = pdfjsLib.getDocument(pdfFile);
            const pdf = await loadingTask.promise;
        
          
            if (currentPage < 1) {
                console.warn(`Page number should start from 1. Resetting to page 1.`);
                currentPage = 1;
            }
            if (currentPage > pdf.numPages) {
                console.warn(`Page number exceeds total pages (${pdf.numPages}). Resetting to last page.`);
                currentPage = pdf.numPages;
            }
        
            const page = await pdf.getPage(currentPage);
            console.log(`Processing page ${currentPage}`);
        
            const scale = pdfScale;
            const viewport = page.getViewport({ scale });
        
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
        
            await page.render({ canvasContext: context, viewport }).promise;
        
            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!imageBlob) throw new Error("Failed to create image blob.");
        
            const imageFile = new File([imageBlob], `page-${currentPage}.png`, { type: 'image/png' });
        
            console.log(`Page ${currentPage} successfully converted to image.`);
            
            // Process with the model
            await processImageWithPrompt(imageFile, "Detect text within shapes.");
        } catch (error) {
            console.error('Error processing page:', error);
        }
        
    };
    
   
    useEffect(() => {
        const fetchShapes = async () => {
            if (!pdfId) return;
    
            try {
                const response = await fetch(`http://localhost:4000/api/shapes/get/${pdfId}/${currentPage}`);
                if (response.ok) {
                    const data = await response.json();
                   
                    setAllShapes(prev => ({
                        ...prev,
                        [currentPage]: data.shapes || []
                    }));
                   
                    setShapes(data.shapes || []);
                }
            } catch (error) {
                console.error("Error fetching shapes:", error);
                setShapes([]);
            }
        };
    
        fetchShapes();
    }, [pdfId, currentPage]);
    
   
    const handlePageChange = (e) => {
        const newPage = e.currentPage;
        setCurrentPage(newPage);
     
        if (allShapes[newPage]) {
            setShapes(allShapes[newPage]);
        } else {
            setShapes([]);
        }
    };

   
    const saveTemplate = async () => {
        if (!pdfFile || !pdfId || !templateName || !templateDescription) return;

        try {
            // Save shapes for current page
            const currentPageShapes = shapes.map(shape => ({
                type: shape.type,
                coords: {
                    x: shape.x,
                    y: shape.y,
                    width: shape.width,
                    height: shape.height,
                    radius: shape.radius || null,
                    points: shape.points || null
                }
            }));

            // Save shapes for current page
            const shapeSaveResponse = await fetch('http://localhost:4000/api/shapes/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pdfId,
                    pageNumber: currentPage,
                    shapes: currentPageShapes
                }),
            });

            if (!shapeSaveResponse.ok) {
                throw new Error('Failed to save shapes');
            }

            // Save template with all shapes
            const templateResponse = await fetch('http://localhost:4000/api/template/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateName,
                    description: templateDescription,
                    pdfId,
                    shapes: currentPageShapes
                }),
            });

            if (templateResponse.ok) {
                alert("Template saved successfully!");
                setIsModalOpen(false);
            } else {
                throw new Error('Failed to save template');
            }
        } catch (error) {
            console.error("Error saving template:", error);
            alert("Error saving template: " + error.message);
        }
    };

    

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFiles = [...e.dataTransfer.files];
        setFiles(droppedFiles);
        const pdfFile = droppedFiles.find(file => file.type === 'application/pdf');
        if (pdfFile) {
            setPdfFile(URL.createObjectURL(pdfFile)); // Set PDF URL for viewing
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };
    const handleFileChange = async (e) => {
        const selectedFiles = [...e.target.files];
        setFiles(selectedFiles);
        const pdfFile = selectedFiles.find(file => file.type === 'application/pdf');
    
        if (pdfFile) {
            try {
             
                const formData = new FormData();
                formData.append('file', pdfFile);
    
              
                const response = await fetch('http://localhost:4000/api/pdf/upload', {
                    method: 'POST',
                    body: formData,
                });
    
               
                const responseText = await response.text();
                console.log("Raw response:", responseText);
    
                if (response.ok) {
                    const data = JSON.parse(responseText);
                    const { pdfId } = data;
                    setPdfId(pdfId);
                    setPdfFile(URL.createObjectURL(pdfFile)); 
                } else {
                    alert("Error uploading PDF: " + responseText);
                }
            } catch (error) {
                console.error("Error uploading PDF:", error);
                alert("Error uploading PDF");
            }
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleMouseDown = (e) => {
        if (!isDrawingEnabled) return;
        const { x, y } = e.target.getStage().getPointerPosition();
        const newShape = {
            id: Date.now(),
            type: selectedShapeType,
            x,
            y,
            width: 0, // Start with zero width
            height: 0, // Start with zero height
            radius: 0, // Start with zero radius
            points: selectedShapeType === 'line' ? [x, y, x, y] : null, // Start with the same point for line
            page: currentPage, // Associate shape with the current page
        };
        setNewShape(newShape);
        setIsDrawing(true);
    };

    const handleMouseUp = async () => {
        if (isDrawing && newShape) {
            const updatedShapes = [...shapes, newShape];
            setShapes(updatedShapes);
            
          
            setAllShapes(prev => ({
                ...prev,
                [currentPage]: updatedShapes
            }));

           
            try {
                const shapesToSave = updatedShapes.map(shape => ({
                    type: shape.type,
                    coords: {
                        x: shape.x,
                        y: shape.y,
                        width: shape.width,
                        height: shape.height,
                        radius: shape.radius || null,
                        points: shape.points || null
                    }
                }));

                await fetch('http://localhost:4000/api/shapes/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pdfId,
                        pageNumber: currentPage,
                        shapes: shapesToSave
                    }),
                });
            } catch (error) {
                console.error("Error saving new shape:", error);
            }

            setNewShape(null);
            setIsDrawing(false);
            setIsDrawingEnabled(false);
        }
    };

    const handleMouseMove = (e) => {
        if (isDrawing) {
            const { x, y } = e.target.getStage().getPointerPosition();
            setNewShape(prevShape => ({
                ...prevShape,
                width: x - prevShape.x, // Dynamic width for rectangle
                height: y - prevShape.y, // Dynamic height for rectangle
                radius: selectedShapeType === 'circle'
                    ? Math.sqrt(Math.pow(x - prevShape.x, 2) + Math.pow(y - prevShape.y, 2))
                    : null, // Dynamic radius for circle
                points: selectedShapeType === 'line' ? [prevShape.x, prevShape.y, x, y] : null, // Dynamic points for line
            }));
        }
    };

    const openToolbox = () => {
        setIsToolboxOpen(!isToolboxOpen);
    };

    const selectShape = (shapeType) => {
        setSelectedShapeType(shapeType);
        setIsDrawingEnabled(true);
        setIsToolboxOpen(false);
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setPdfPages([...Array(numPages).keys()]);
    };

  

    return (
        <div className="max-w-2xl mx-auto p-6 lg:pt-0 pt-[34%]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.docx,.doc,.png,.jpg,.tiff,.csv,.txt"
                />

                <motion.div
                    className="mb-6 bg-green-500 text-white p-4 rounded-xl shadow-lg text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="font-semibold">Upload a file</span>
                        <span className="text-green-100 ml-2">
                            PDF, DOCX, DOC, PNG, JPG, TIFF, CSV, TXT
                        </span>
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
                        <p className="text-lg text-gray-600">
                            or drag and drop here
                        </p>
                    </motion.div>
                </motion.label>
            </motion.div>

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
                                className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-gray-200/30 shadow-sm"
                            >
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {file.name}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                    >
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
                <div className="flex space-x-4 mt-4">
                    {/* Toolbox Icon */}
                    <div className="relative">
                        <button
                            onClick={openToolbox}
                            className="bg-blue-500 text-white p-2 rounded flex items-center"
                        >
                            <Shapes className="w-5 h-5 mr-2" /> Shapes
                        </button>
                        {/* Toolbox Dropdown */}
                        {isToolboxOpen && (
                            <div className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={() => selectShape('rectangle')}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                    Rectangle
                                </button>
                                <button
                                    onClick={() => selectShape('circle')}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                    Circle
                                </button>
                                <button
                                    onClick={() => selectShape('line')}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                    Line
                                </button>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white p-2 rounded ml-2">
                Save Template
            </button>
            <button 
                        onClick={sendPageToModel} 
                        className="bg-purple-500 text-white p-2 rounded ml-2"
                    >
                        Process Page
                    </button>
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
                            Add a name and description for your template
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); saveTemplate(); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue transition-all duration-200"
                                    placeholder="Enter template name"
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
       
                </div>
            </AnimatePresence>

            {pdfFile && (
                <div className="relative mt-6 p-4 border border-gray-300 rounded-lg">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div id="pdf-container" className="relative">
                            <Viewer
                                fileUrl={pdfFile}
                                onDocumentLoadSuccess={onDocumentLoadSuccess}
                                onPageChange={handlePageChange} 
                            />
                        </div>
                    </Worker>

                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <Stage
                            ref={stageRef}
                            width={document.getElementById("pdf-container")?.offsetWidth || 800}
                            height={document.getElementById("pdf-container")?.offsetHeight || 1000}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            className="absolute top-0 left-0 pointer-events-auto"
                        >
                            <Layer>
                             
                                {shapes.map((shape, i) => {
    
    
    if (shape.page === currentPage) {
        if (shape.type === 'rectangle') {
            return (
                <Rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    draggable
                    stroke="red"
                    strokeWidth={2}
                    onClick={() => setSelectedId(shape.id)}
                    onDragEnd={(e) => {
                        const updatedShapes = shapes.map((s) =>
                            s.id === shape.id 
                                ? { ...s, x: e.target.x(), y: e.target.y() } 
                                : s
                        );
                        setShapes(updatedShapes);
                    }}
                />
            );
        }
        // ... similar updates for Circle and Line components
    }
    return null;
})}
                             
                                {newShape && (
                                    <>
                                        {newShape.type === 'rectangle' && (
                                            <Rect
                                                {...newShape}
                                                stroke="red"
                                                strokeWidth={2}
                                            />
                                        )}
                                        {newShape.type === 'circle' && (
                                            <Circle
                                                {...newShape}
                                                stroke="blue"
                                                strokeWidth={2}
                                            />
                                        )}
                                        {newShape.type === 'line' && (
                                            <Line
                                                points={newShape.points}
                                                stroke="green"
                                                strokeWidth={2}
                                            />
                                        )}
                                    </>
                                )}
                            </Layer>
                        </Stage>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trigger;