import { useState } from 'react'; // Import useState
import { Routes, Route } from "react-router-dom";


import Sidebar from './Sidebar';
import Overview from './Overview';
import MyTemplates from './MyTemplates';
import Loadtemplate from './Loadtemplate';
import Trigger from './Trigger';

const DashboardHome = () => {
    const [isOpen, setIsOpen] = useState(true); // State for toggling menu

    return (
        <section className="pt-[7%] bg-white h-full  mb-6 px-0 h-auto flex flex-row items-start">
            <aside
                className={`leftDashboard flex flex-col gap-2 transition-all duration-700`}
                style={{ width: isOpen ? '17%' : '0' }} // Use inline style for smooth transition
            >
                <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} /> {/* Pass props */}
            </aside>
            <aside
                className={`rightDashboard bg-[#f8f8fa] transition-all duration-700 px-[2%]`}
                style={{ width: isOpen ? '83%' : '99%' }} // Use inline style for smooth transition
            >
                <Routes>
                    <Route index element={<Overview />} />
                    <Route path="template" element={<MyTemplates />} />
                    <Route path="/uploadfile" element={<Loadtemplate />} />
                    <Route path="/results" element={<Trigger />} />
                </Routes>
            </aside>
        </section>
    );
};

export default DashboardHome;
