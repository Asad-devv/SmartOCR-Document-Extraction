import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, Shapes } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { Stage, Layer, Rect } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import processImageWithPrompt from './prompt';
import * as pdfjsLib from 'pdfjs-dist';

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
    const [currentPage, setCurrentPage] = useState(0);
    const stageRef = useRef(null);
    const pdfContainerRef = useRef(null);
    const [pdfId, setPdfId] = useState(null);
    const [allShapes, setAllShapes] = useState({});
    const [pdfScale, setPdfScale] = useState(1.0);
    const [previewImage, setPreviewImage] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [fieldName, setFieldName] = useState('');
    const [pdfs, setPdfs] = useState([]);

    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

        const fetchPdfs = async () => {
            const response = await fetch('http://localhost:4000/api/pdf/list');
            const data = await response.json();
            setPdfs(data.map(pdf => ({
                pdfId: pdf.pdfId,
                url: `http://localhost:4000/api/pdf/fetch/${pdf.pdfId}`,
                shapes: [],
            })));
        };
        const fetchTemplates = async () => {
            const response = await fetch('http://localhost:4000/api/template/get');
            const data = await response.json();
            setTemplates(data);
        };
        fetchPdfs();
        fetchTemplates();
    }, []);

    const selectPdf = (pdf) => {
        setPdfFile(pdf.url);
        setPdfId(pdf.pdfId);
        setShapes(allShapes[pdf.pdfId]?.[currentPage] || []);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:4000/api/pdf/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.pdfId) {
                const newPdf = {
                    pdfId: data.pdfId,
                    url: `http://localhost:4000/api/pdf/fetch/${data.pdfId}`,
                    shapes: [],
                };
                setPdfs(prev => [...prev, newPdf]);
                setPdfFile(newPdf.url);
                setPdfId(newPdf.pdfId);
            }
        } catch (error) {
            console.error("Error uploading PDF:", error);
        }
    };

    const saveTemplate = async (e) => {
        e.preventDefault();
        if (!pdfId || !shapes.length) return;

        const shapesToSave = shapes.map(shape => ({
            type: shape.type,
            fieldName: fieldName || `Field_${shape.id}`,
            coords: {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
            },
        }));

        try {
            const response = await fetch('http://localhost:4000/api/template/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateName,
                    description: templateDescription,
                    pdfId,
                    pageNumber: currentPage + 1,
                    shapes: shapesToSave,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setTemplates([...templates, data]);
                setIsModalOpen(false);
                setTemplateName('');
                setTemplateDescription('');
                setFieldName('');
            }
        } catch (error) {
            console.error("Error saving template:", error);
        }
    };

    const applyTemplate = async (templateId) => {
        if (!pdfId) {
            console.error("No PDF selected to apply template to.");
            return;
        }

        console.log("Applying template with:", { templateId, pdfId });

        try {
            const response = await fetch('http://localhost:4000/api/template/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId, pdfId }),
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", [...response.headers.entries()]);

            if (!response.ok) {
                const text = await response.text();
                console.error("Response not OK:", response.status, text);
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
            }

            const contentType = response.headers.get('Content-Type');
            console.log("Content-Type:", contentType);

            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error("Response is not JSON:", text);
                throw new Error(`Expected JSON, got ${contentType}: ${text}`);
            }

            const data = await response.json();
            console.log("Parsed response data:", data);

            const { template } = data;
            if (!template) {
                console.error("No template data in response:", data);
                return;
            }

            console.log("Raw template data:", template);

            const pageNum = template.pageNumber ? template.pageNumber - 1 : 0; 
            const appliedShapes = template.shapes.map(shape => ({
                id: uuidv4(),
                type: shape.type,
                x: shape.coords.x,
                y: shape.coords.y,
                width: shape.coords.width,
                height: shape.coords.height,
                page: pageNum,
                fieldName: shape.fieldName,
            }));

            console.log("Setting shapes:", appliedShapes);
            console.log("Switching to page:", pageNum);

        
            setShapes([...appliedShapes]);
            setAllShapes(prev => {
                const newAllShapes = {
                    ...prev,
                    [pdfId]: {
                        ...prev[pdfId] || {},
                        [pageNum]: [...appliedShapes],
                    },
                };
                console.log("Updated allShapes:", newAllShapes);
                return newAllShapes;
            });
            setCurrentPage(pageNum);

           
            setTimeout(() => {
                console.log("Post-update shapes:", shapes);
                console.log("Post-update allShapes:", allShapes);
                console.log("Post-update currentPage:", currentPage);
            }, 0);
        } catch (error) {
            console.error("Error applying template:", error);
        }
    };

    const sendPageToModel = async () => {
        if (!pdfId || !pdfFile) return;

        try {
            const response = await fetch(pdfFile);
            const pdfData = await response.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            const page = await pdf.getPage(currentPage + 1);
            const viewport = page.getViewport({ scale: pdfScale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;

            const pdfHeight = viewport.height;
            shapes.forEach(shape => {
                if (shape.page === currentPage && shape.type === 'rectangle') {
                    context.strokeStyle = 'red';
                    context.lineWidth = 2;
                    const adjustedY = pdfHeight - shape.y - shape.height;
                    context.strokeRect(shape.x, adjustedY, shape.width, shape.height);
                }
            });

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const imageFile = new File([imageBlob], `page-${currentPage + 1}.png`, { type: 'image/png' });
            const imageURL = URL.createObjectURL(imageBlob);
            setPreviewImage(imageURL);
            setIsPreviewModalOpen(true);

            const modelResponse = await processImageWithPrompt(
                imageFile,
                `Extract text within red rectangles and return as JSON with field names: ${shapes
                    .map(s => s.fieldName || `Field_${s.id}`)
                    .join(', ')}`
            );
            console.log("Model Response:", modelResponse);
        } catch (error) {
            console.error("Error processing page:", error);
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
            handleFileChange({ target: { files: [pdfFile] } });
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

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleMouseDown = (e) => {
        if (!isDrawingEnabled) return;
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewShape({
            id: Date.now(),
            type: selectedShapeType,
            x,
            y,
            width: 0,
            height: 0,
            page: currentPage,
        });
        setIsDrawing(true);
    };

    const handleMouseUp = () => {
        if (isDrawing && newShape) {
            const updatedShapes = [...shapes, newShape];
            setShapes(updatedShapes);
            setAllShapes(prev => ({
                ...prev,
                [pdfId]: {
                    ...prev[pdfId],
                    [currentPage]: updatedShapes,
                },
            }));
            setIsDrawing(false);
            setNewShape(null);
            setIsDrawingEnabled(false);
        }
    };

    const handleMouseMove = (e) => {
        if (isDrawing) {
            const { x, y } = e.target.getStage().getPointerPosition();
            setNewShape(prev => ({
                ...prev,
                width: x - prev.x,
                height: y - prev.y,
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

    const handlePageChange = (e) => {
        const newPage = e.currentPage;
        setCurrentPage(newPage);
        setShapes(allShapes[pdfId]?.[newPage] || []);
        console.log("Page changed to:", newPage, "Shapes:", allShapes[pdfId]?.[newPage] || []);
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

            <div className="flex space-x-4 mt-4 sticky top-0 z-10 bg-white p-2 rounded-lg shadow-md">
                <div className="relative">
                    <button
                        onClick={openToolbox}
                        className="bg-blue-500 text-white p-2 rounded flex items-center"
                    >
                        <Shapes className="w-5 h-5 mr-2" /> Shapes
                    </button>
                    {isToolboxOpen && (
                        <div className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
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
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-500 text-white p-2 rounded ml-2"
                >
                    Save Template
                </button>
                <button
                    onClick={sendPageToModel}
                    className="bg-purple-500 text-white p-2 rounded ml-2"
                >
                    Process Page
                </button>
                <select onChange={e => applyTemplate(e.target.value)} className="ml-2 p-2">
                    <option value="">Apply Template</option>
                    {templates.map(template => (
                        <option key={template._id} value={template._id}>
                            {template.templateName}
                        </option>
                    ))}
                </select>
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
                                className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-gray-200/30 shadow-sm"
                            >
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500 }}
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
            </AnimatePresence>

            {pdfFile && (
                <div className="relative mt-6 p-4 border border-gray-300 rounded-lg">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div id="pdf-container" ref={pdfContainerRef} className="relative">
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
                            width={document.getElementById('pdf-container')?.offsetWidth || 800}
                            height={document.getElementById('pdf-container')?.offsetHeight || 1000}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            className="absolute top-0 left-0 pointer-events-auto"
                        >
                            <Layer>
                                {console.log("Rendering shapes:", shapes)}
                                {shapes.map((shape, i) =>
                                    shape.page === currentPage && shape.type === 'rectangle' ? (
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
                                            onDragEnd={e => {
                                                const updatedShapes = shapes.map(s =>
                                                    s.id === shape.id
                                                        ? { ...s, x: e.target.x(), y: e.target.y() }
                                                        : s
                                                );
                                                setShapes(updatedShapes);
                                                setAllShapes(prev => ({
                                                    ...prev,
                                                    [pdfId]: {
                                                        ...prev[pdfId],
                                                        [currentPage]: updatedShapes,
                                                    },
                                                }));
                                            }}
                                        />
                                    ) : null
                                )}
                                {newShape && newShape.type === 'rectangle' && (
                                    <Rect {...newShape} stroke="red" strokeWidth={2} />
                                )}
                            </Layer>
                        </Stage>
                    </div>
                </div>
            )}

            <div className="pdf-list mt-4">
                {pdfs.map(pdf => (
                    <button
                        key={pdf.pdfId}
                        onClick={() => selectPdf(pdf)}
                        className="p-2 bg-gray-200 rounded mr-2"
                    >
                        {pdf.pdfId}
                    </button>
                ))}
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
                            Add a name and description for your template
                        </h2>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={templateDescription}
                                    onChange={e => setTemplateDescription(e.target.value)}
                                    rows="4"
                                    className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue transition-all duration-200"
                                    placeholder="Enter template description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Field Name (applied to all shapes)
                                </label>
                                <input
                                    type="text"
                                    value={fieldName}
                                    onChange={e => setFieldName(e.target.value)}
                                    className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue transition-all duration-200"
                                    placeholder="Field Name (optional)"
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
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/90 backdrop-blur-md rounded-xl p-6 w-full max-w-4xl mx-4 shadow-2xl border border-gray-200/30"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Preview Image</h2>
                        <img
                            src={previewImage}
                            alt="Preview of processed page"
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                        <div className="flex justify-end mt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsPreviewModalOpen(false)}
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