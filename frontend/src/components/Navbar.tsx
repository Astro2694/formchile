import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold">
              LMS
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition">
                Dashboard
              </Link>
              <Link to="/courses" className="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition">
                Courses
              </Link>
              {isAdmin && (
                <>
                  <Link to="/users" className="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition">
                    Users
                  </Link>
                  <Link to="/reports" className="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition">
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
