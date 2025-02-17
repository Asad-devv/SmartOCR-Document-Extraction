import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MyTemplates = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        templateName: '',
        description: ''
    });
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/template/get');
                const data = await response.json();
                setTemplates(data);
            } catch (error) {
                console.error("Error fetching templates:", error);
            }
        };

        fetchTemplates();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTemplate(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/api/template/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTemplate),
            });

            const data = await response.json();
            if (response.ok) {
                setTemplates([...templates, data]);
                setIsModalOpen(false);
                setNewTemplate({ templateName: '', description: '' });
            } else {
                console.error("Error saving template:", data);
            }
        } catch (error) {
            console.error("Error saving template:", error);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='p-3 rounded-md mt-12 sm:mt-0 lg:pt-0 pt-[10%]'
        >
            <div className="topCardAppointment p-6 bg-white/30 backdrop-blur-md shadow-lg rounded-t-xl border-b-0 flex flex-col md:flex-row items-start md:items-center justify-between">
                <motion.h1
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="text-2xl font-[500] mb-3 md:mb-0 text-gray-800"
                >
                    Template Management
                </motion.h1>
                <motion.div
                    initial={{ x: 20 }}
                    animate={{ x: 0 }}
                    className="flex items-center gap-4 w-full md:w-auto"
                >
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group flex items-center gap-2 bg-gradient-to-r from-themeBlue to-blue-600 text-white border border-themeBlue rounded-lg px-4 py-2 hover:shadow-lg hover:scale-105 transition-all duration-200 w-full md:w-auto"
                    >
                        Add template
                    </button>
                </motion.div>
            </div>

            <div className="overflow-x-auto bg-white/20 backdrop-blur-md rounded-b-xl shadow-xl">
                <table className="min-w-full divide-y-2 divide-gray-200/30 text-sm">
                    <thead className="bg-gray-50/50 backdrop-blur-sm">
                        <tr>
                            {["Template name", "Description", "Rules", "Files uploaded", "Actions", "Results"].map((header, index) => (
                                <motion.th
                                    key={header}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700"
                                >
                                    {header}
                                </motion.th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200/30">
                        {templates.map((template, index) => (
                            <motion.tr
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/10 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                            >
                                <td className="flex items-center whitespace-nowrap px-4 py-4">
                                    <span className="text-sm md:text-base font-medium text-gray-700">{template.templateName}</span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-gray-600">{template.description}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-gray-600">{template.rules}</td>
                                <td className="whitespace-nowrap px-4 py-4">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                        {template.filesUploaded} files
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg px-4 py-2 text-sm hover:shadow-lg transition-all duration-200"
                                    >
                                        Upload file
                                    </motion.button>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg px-4 py-2 text-sm hover:shadow-lg transition-all duration-200"
                                    >
                                        View results
                                    </motion.button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
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
                            Add a name and description for your smart template
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="templateName"
                                    value={newTemplate.templateName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeBlue focus:border-themeBlue transition-all duration-200"
                                    placeholder="Enter template name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={newTemplate.description}
                                    onChange={handleInputChange}
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
                                    Add template
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </motion.section>
    );
}

export default MyTemplates;