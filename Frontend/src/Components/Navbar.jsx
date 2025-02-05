import { useState } from "react";
import { ArrowDown, Globe, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../src/assets/logo.png"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslateVisible, setIsTranslateVisible] = useState(false);

  const toggleTranslate = () => {
    setIsTranslateVisible(!isTranslateVisible);
  };

  return (
    <nav className="bg-white shadow-md absolute w-full z-10">
      <div className="px-[2%] mx-auto ">
        <div className="flex justify-between h-24 items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-gray-900">
            <img src={Logo} className="h-24 w-43" alt="" />
          </Link>

          {/* Menu button (mobile) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-900 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Navigation as */}
          <div className="hidden md:flex text-xl space-x-6">
            <Link to="/" className="text-gray-700 py-2 hover:text-blue-500">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 py-2 hover:text-blue-500">
              About
            </Link>
            <Link to="/services" className="text-gray-700 py-2 hover:text-blue-500">
              Services
            </Link>
            <Link to="/contact" className="text-gray-700 py-2 hover:text-blue-500">
              Contact
            </Link>
            <Link to="/dashboard" className="text-gray-700 py-2 hover:text-blue-500">
              Dashboard
            </Link>
            <Link to="/login" className="bg-black py-2 px-5 rounded-md text-gray-200 hover:text-blue-500">
              Login
            </Link>

            <div className="relative">

              <button
                onClick={toggleTranslate}
                className="text-gray-700 py-2 px-3 flex flex-row items-center border rounded-lg p-1 text-[14px] hover:text-blue-500">
                <Globe className="w-4" /> <ArrowDown className="w-4" />
              </button>

              <div
                id="google_translate_element"
                className={`absolute transform bg-white -translate-x-[10%] transition-transform duration-300 ${isTranslateVisible ? "top-16 right-[-4%]" : "top-[-400%]"} p-2 border border-gray-300 text-white rounded-lg shadow-md max-w-xs mx-auto`}
              >
                {/* You can add content for the translation options here */}
              </div>
            </div>
            
           
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-2">
          <Link to="/" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/about" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/services" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setIsOpen(false)}>
            Services
          </Link>
          <Link to="/contact" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
          <Link to="/dashboard" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
