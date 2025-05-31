// File: src/components/Layout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to={user?.type === 'business' ? '/business/dashboard' : '/creator/dashboard'}>
                  <h1 className="text-xl font-bold text-indigo-600">InfluencerCollab</h1>
                </Link>
              </div>
              <nav className="ml-6 flex space-x-8">
                {user?.type === 'business' && (
                  <Link 
                    to="/business/dashboard" 
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Creators
                  </Link>
                )}
                {user && (
                  <Link 
                    to={user.type === 'business' ? '/business/chats' : '/creator/chats'} 
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Chats
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="ml-4 flex items-center">
                  <span className="mr-4 text-gray-700">
                    {user.type === 'business' ? user.business_name : user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <Link to="/business/login" className="text-sm text-indigo-600 hover:text-indigo-800">
                    Business Login
                  </Link>
                  <Link to="/creator/login" className="text-sm text-indigo-600 hover:text-indigo-800">
                    Creator Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Influencer Collaboration Platform
          </p>
        </div>
      </footer>
    </div>
  );
}