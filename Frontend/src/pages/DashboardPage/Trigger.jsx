import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const Trigger = () => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [pdfFile, setPdfFile] = useState(null); // State to store the PDF file

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
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

    const handleFileChange = (e) => {
        const selectedFiles = [...e.target.files];
        setFiles(selectedFiles);
        const pdfFile = selectedFiles.find(file => file.type === 'application/pdf');
        if (pdfFile) {
            setPdfFile(URL.createObjectURL(pdfFile)); // Set PDF URL for viewing
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
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
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer 
                        ${dragActive
                            ? 'border-green-500 bg-green-50/30'
                            : 'border-gray-300 bg-white/30'} 
                        backdrop-blur-md transition-all duration-300 hover:border-green-500 hover:bg-green-50/30`}
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
            </AnimatePresence>

            {/* Display the PDF if it's uploaded */}
            {pdfFile && (
                <div className="mt-6 p-4 border border-gray-300 rounded-lg">
                    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                        <Viewer fileUrl={pdfFile} />
                    </Worker>
                </div>
            )}
        </div>
    );
};

export default Trigger;
