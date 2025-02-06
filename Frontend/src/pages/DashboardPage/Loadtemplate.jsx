import { useState } from 'react';
import { LuFileUp, LuFile, LuLoader2 } from 'react-icons/lu';
import { motion } from 'framer-motion';
import Analysis from './Analysis';

const Loadtemplate = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false)

  const templates = [
    { id: 1, name: 'Invoice Template' },
    { id: 2, name: 'Receipt Template' },
    { id: 3, name: 'Form Template' },
    // Add more templates as needed
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate upload progress - replace with actual upload logic
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadComplete(true)
      }
    }, 500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen p-2 sm:p-4 lg:pt-0 pt-[27%] max-w-[90%] mx-auto"
    >
      <div className=" mx-auto relative">
        {uploadComplete ? <Analysis /> :

          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full p-3 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl border border-gray-200 focus:border-themeBlue focus:ring-2 focus:ring-themeBlue transition-all duration-300 outline-none shadow-lg"
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </motion.div>


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`relative p-8 rounded-2xl transition-all duration-300
            ${dragActive
                  ? 'bg-themeBlue bg-opacity-10 border-2 border-themeBlue'
                  : 'bg-white bg-opacity-20 border border-gray-200'} 
            backdrop-blur-lg shadow-xl hover:shadow-2xl`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <LuFileUp className="mx-auto h-12 w-12 text-themeBlue mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Upload your file
                </h3>
                <p className="text-gray-600 mb-6">
                  Drag and drop your file here, or click to select
                </p>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOCX, DOC, PNG, JPG, TIFF, CSV, TXT
                  </p>
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="cursor-pointer"
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc,.png,.jpg,.tiff,.csv,.txt"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-themeBlue text-white rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg">
                      <LuFile className="h-5 w-5" />
                      Choose File
                    </span>
                  </motion.label>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, width: '0%' }}
                animate={{ opacity: 1, width: '0%' }}
                className="absolute bottom-0 left-0 h-1 bg-themeBlue rounded-full"
              />
            </motion.div>

            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <div className="bg-white bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Document Import and Preprocessing
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    We are currently importing and preprocessing your documents.
                    This process should not take more than a minute.
                  </p>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="absolute h-full bg-themeBlue rounded-full"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Step 2/2 - Document Preprocessing</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="flex justify-center mt-4">
                    <LuLoader2 className="w-6 h-6 text-themeBlue animate-spin" />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        }


      </div>
    </motion.div>
  );
};

export default Loadtemplate;