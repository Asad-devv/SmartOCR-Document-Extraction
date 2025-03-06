import { FaCalendarAlt, FaClipboard, FaUserMd, FaBookMedical, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => { // Accept props
    const location = useLocation();

    const menuVariants = {
        closed: {
            x: "-100%",
            transition: {
                duration: 0.5,
                type: "spring",
                damping: 25,
                stiffness: 120
            }
        },
        open: {
            x: 0,
            transition: {
                duration: 0.5,
                type: "spring",
                damping: 25,
                stiffness: 120
            }
        }
    };

    return (
        <div className="relative bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)} // Toggle function
                className="fixed z-20 top-[12%] left-[-0.5%] p-3 rounded-lg bg-themeBlue text-white shadow-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                aria-label="Toggle Menu"
            >
                {!isOpen ? <FaArrowRight size={10} />
                    : <FaArrowLeft size={10} />}

            </button>

            <motion.div
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                variants={menuVariants}
                className="fixed lg:top-[12%] top-[11%] left-0 h-full bg-white shadow-lg z-10 w-64"
            >
                <div className="p-4 lg:pt-2 pt-[25%]"> {/* Added top padding to avoid overlap with button */}

                    {/* First Set of Buttons */}
                    <div className="space-y-5">
                        <Link
                            to="/dashboard"
                            className={`flex items-center space-x-2 p-3 rounded-md w-full transition-all duration-300 ${location.pathname === "/dashboard" ? 'bg-themeBlue text-white' : 'bg-transparent text-black'}`}
                        >
                            <FaUserMd />
                            <span>Overview</span>
                        </Link>
                        <Link
                            to="/dashboard/template"
                            className={`flex items-center space-x-2 p-3 rounded-md w-full transition-all duration-300 ${location.pathname === "/dashboard/template" ? 'bg-themeBlue text-white' : 'bg-transparent text-black'}`}
                        >
                            <FaClipboard />
                            <span>My Templates</span>
                        </Link>
                        <Link
                            to="/dashboard/uploadfile"
                            className={`flex items-center space-x-2 p-3 rounded-md w-full transition-all duration-300 ${location.pathname === "/dashboard/uploadfile" ? 'bg-themeBlue text-white' : 'bg-transparent text-black'}`}
                        >
                            <FaCalendarAlt />
                            <span>Load template</span>
                        </Link>
                        <Link
                            to="/dashboard/results"
                            className={`flex items-center space-x-2 p-3 rounded-md w-full transition-all duration-300 
                                ${location.pathname === "/dashboard/results" ? 'bg-themeBlue text-white' : 'bg-transparent text-black'}`}
                        >
                            <FaBookMedical />
                            <span>Trigger</span>
                        </Link>

                    </div>



                </div>
            </motion.div>
        </div>
    );
};

export default Sidebar;
