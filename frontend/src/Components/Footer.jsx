import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AbhiyanSetu
          </h3>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Empowering brands and creators to launch impactful campaigns with
            cutting-edge marketing solutions.
          </p>

          <div className="flex justify-center space-x-6 mb-6">
            <a
              href="#"
              className="text-gray-400 hover:text-pink-400 transition-colors"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-pink-400 transition-colors"
            >
              Services
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-pink-400 transition-colors"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-pink-400 transition-colors"
            >
              Privacy Policy
            </a>
          </div>

          <div className="text-gray-600 text-sm">
            © {new Date().getFullYear()} AbhiyanSetu. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
