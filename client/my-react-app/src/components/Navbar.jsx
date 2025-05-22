import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-n-7 border-b border-n-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            Event Platform
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-n-2 hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/events"
              className="text-n-2 hover:text-primary transition-colors"
            >
              Events
            </Link>
            <Link
              to="/my-registrations"
              className="text-n-2 hover:text-primary transition-colors"
            >
              My Registrations
            </Link>
          </div>

          {/* Mobile Navigation Button */}
          <button
            className="md:hidden text-n-2 hover:text-primary"
            onClick={toggleMenu}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-n-6">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-n-2 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/events"
                className="text-n-2 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              <Link
                to="/my-registrations"
                className="text-n-2 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Registrations
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
