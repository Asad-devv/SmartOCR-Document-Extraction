import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../src/assets/logo.png"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md absolute w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <Link to="/login" className="bg-black py-2 px-5 rounded-md text-gray-200 hover:text-blue-500">
              Login
            </Link>
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
