
import { motion } from 'framer-motion';
import { Upload, FileDown, File } from 'lucide-react';

const Overview = () => {
    const steps = [
        {
            title: "Step 1",
            description: "Define a repeated template of PDF or PNG",
            buttonText: "My Templates",
            icon: <File className="w-8 h-8" />
        },
        {
            title: "Step 2",
            description: "Add a PDF file of that template",
            buttonText: "Upload File",
            icon: <Upload className="w-8 h-8" />
        },
        {
            title: "Step 3",
            description: "Generate result in XLS",
            buttonText: "Download File",
            icon: <FileDown className="w-8 h-8" />
        }
    ];


    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (index) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: index * 0.2,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 lg:pt-4 pt-[30%] p-8 justify-center items-stretch min-h-[400px]">
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="relative w-full md:w-72 p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-between group"
                    style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    }}
                >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#2067A5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="space-y-4 text-center relative z-10">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-16 h-16 mx-auto rounded-full bg-[#2067A5]/20 flex items-center justify-center text-[#2067A5]"
                        >
                            {step.icon}
                        </motion.div>

                        <h3 className="text-xl font-semibold text-[#2067A5]">
                            {step.title}
                        </h3>

                        <p className="text-gray-600 text-sm">
                            {step.description}
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 px-6 py-2 rounded-lg bg-[#2067A5] text-white font-medium hover:bg-[#2067A5]/90 transition-colors duration-300 shadow-lg"
                    >
                        {step.buttonText}
                    </motion.button>
                </motion.div>
            ))}
        </div>
    );
};

export default Overview;