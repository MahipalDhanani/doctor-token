import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Header = ({ user, isAdmin, toggleSidebar, sidebarOpen }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
      <div className={`px-4 sm:px-6 lg:px-8 ${user ? 'lg:ml-64' : ''} max-w-none`}>
        <div className="flex justify-between items-center py-4">
          {/* Left side - Logo and hamburger */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="flex items-center ml-2">
              <h1 className="text-xl font-bold text-primary">
                Clinic Token Manager
              </h1>
            </Link>
          </div>

          {/* Right side - User menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Hello, {user.user_metadata.first_name} {user.user_metadata.last_name}
                </span>
                {isAdmin && (
                  <span className="bg-primary text-white px-2 py-1 rounded text-xs">
                    Admin
                  </span>
                )}
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;