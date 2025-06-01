import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, LogOut, User, Building2, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleTranslate from '../pages/GoogleTranslate';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Navigation items based on user type
  const getNavItems = () => {
    if (!user) {
      // Guest user navigation
      return [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' }
      ];
    } else if (user.type === 'business') {
      // Business user navigation
      return [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/business/dashboard' },
        { name: 'CRS', path: '/business/recommender' },
        { name: 'Channels', path: '/business/ytchecker' },
        { name: 'Analytics', path: '/business/analytics' },
        // { name: 'Outreach', path: '/business/outreach' },
        { name: 'Contract', path: '/business/confirm' },
        { name: 'Messages', path: '/business/chats' }
      ];
    } else if (user.type === 'creator') {
      // Creator user navigation
      return [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/creator/dashboard' },
        { name: 'Opportunities', path: '/creator/opportunities' },
        { name: 'Portfolio', path: '/creator/portfolio' },
        { name: 'Messages', path: '/creator/messages' },
        { name: 'Profile', path: '/creator/profile' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  // Get theme colors based on user type
  const getTheme = () => {
    if (user?.type === 'business') {
      return {
        gradient: 'from-blue-500 to-purple-500',
        textGradient: 'from-blue-400 to-purple-400',
        activeText: 'text-blue-400',
        buttonGradient: 'from-blue-600 to-purple-600',
        buttonHover: 'from-blue-700 to-purple-700',
        icon: Building2,
        title: 'AbhiyanSetu Business'
      };
    } else if (user?.type === 'creator') {
      return {
        gradient: 'from-purple-500 to-pink-500',
        textGradient: 'from-purple-400 to-pink-400',
        activeText: 'text-purple-400',
        buttonGradient: 'from-purple-600 to-pink-600',
        buttonHover: 'from-purple-700 to-pink-700',
        icon: Sparkles,
        title: 'AbhiyanSetu Creator'
      };
    } else {
      return {
        gradient: 'from-purple-500 to-pink-500',
        textGradient: 'from-purple-400 to-pink-400',
        activeText: 'text-purple-400',
        buttonGradient: 'from-purple-600 to-pink-600',
        buttonHover: 'from-purple-700 to-pink-700',
        icon: Zap,
        title: 'AbhiyanSetu'
      };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  return (
    <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className={`bg-gradient-to-r ${theme.gradient} p-2 rounded-lg`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
              {theme.title}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors ${
                  location.pathname === item.path
                    ? theme.activeText
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* User info and logout for logged in users */}
            {user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className={`bg-gradient-to-r ${theme.gradient} p-1.5 rounded-full`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-300 hidden lg:block">
                    {user.name || user.email}
                  </span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300 capitalize">
                    {user.type}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Auth buttons for guest users */}
            {!user && (
              <div className="flex items-center space-x-4">
                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                    className={`flex items-center space-x-1 bg-gradient-to-r ${theme.buttonGradient} text-white px-4 py-2 rounded-lg hover:${theme.buttonHover} transition-all duration-300`}
                  >
                    <span>Login</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showAuthDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1">
                      <Link
                        to="/business/login"
                        onClick={() => setShowAuthDropdown(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span>Business Login</span>
                      </Link>
                      <Link
                        to="/creator/login"
                        onClick={() => setShowAuthDropdown(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Creator Login</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Register Buttons */}
                <Link
                  to="/business/register"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium"
                >
                  Start Business
                </Link>
                <Link
                  to="/creator/register"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-medium"
                >
                  Join as Creator
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? `${theme.activeText} bg-gray-700`
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile user info and logout */}
              {user && (
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm text-gray-300 flex items-center space-x-2">
                    <div className={`bg-gradient-to-r ${theme.gradient} p-1.5 rounded-full`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div>{user.name || user.email}</div>
                      <div className="text-xs text-gray-400 capitalize">{user.type} Account</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Mobile auth buttons */}
              {!user && (
                <div className="border-t border-gray-700 pt-2 mt-2 space-y-2">
                  <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wide">Login</div>
                  <Link
                    to="/business/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>Business Login</span>
                  </Link>
                  <Link
                    to="/creator/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Creator Login</span>
                  </Link>
                  
                  <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wide">Register</div>
                  <Link
                    to="/business/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-300 mt-2"
                  >
                    Start Business
                  </Link>
                  <Link
                    to="/creator/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                  >
                    Join as Creator
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};