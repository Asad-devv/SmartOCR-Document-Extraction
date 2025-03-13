// MYTEMPLATE.JSX (inside Dashboard folder)
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MyTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

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

  const handleViewDetails = (templateId) => {
    // Redirect to Trigger page under /dashboard/results with the selected template ID
    navigate('/dashboard/results', { state: { selectedTemplateId: templateId } });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-3 rounded-md mt-12 sm:mt-0 lg:pt-0 pt-[10%]"
    >
      <div className="topCardAppointment p-6 bg-white/30 backdrop-blur-md shadow-lg rounded-t-xl border-b-0 flex flex-col md:flex-row items-start md:items-center justify-between">
        <motion.h1
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="text-2xl font-[500] mb-3 md:mb-0 text-gray-800"
        >
          Template Management
        </motion.h1>
      </div>

      <div className="overflow-x-auto bg-white/20 backdrop-blur-md rounded-b-xl shadow-xl">
        <table className="min-w-full divide-y-2 divide-gray-200/30 text-sm">
          <thead className="bg-gray-50/50 backdrop-blur-sm">
            <tr>
              {["Template name", "Description", "Page", "Actions"].map((header, index) => (
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
                <td className="whitespace-nowrap px-4 py-4 text-gray-700">{template.templateName}</td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-600">{template.description}</td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-600">{template.pageNumber}</td>
                <td className="whitespace-nowrap px-4 py-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewDetails(template._id)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg px-4 py-2"
                  >
                    View Details
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
};

export default MyTemplates;