import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo/Logo";
import { FaHeadphones } from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Handle navigation with auth check
  const handleNavigation = (path) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="bg-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Logo size="large" showText={true} />
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-teal-400 font-bold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation("/trade")}
                  className="text-gray-300 text-sm hover:text-teal-400 transition-colors text-left"
                >
                  Trade
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/market")}
                  className="text-gray-300 text-sm hover:text-teal-400 transition-colors text-left"
                >
                  Market
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/news")}
                  className="text-gray-300 text-sm hover:text-teal-400 transition-colors text-left"
                >
                  News
                </button>
              </li>
              <li>
                <Link to="/help-center" className="text-gray-300 text-sm hover:text-teal-400 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="text-teal-400 font-bold text-sm mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation("/deposit")}
                  className="text-gray-300 text-sm hover:text-teal-400 transition-colors text-left"
                >
                  Deposit
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/withdraw")}
                  className="text-gray-300 text-sm hover:text-teal-400 transition-colors text-left"
                >
                  Withdraw
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/settings?section=identity")}
                  className="text-gray-300 text-sm hover:text-teal-400 transition-colors text-left"
                >
                  Identity Verification
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/trade-history")}
                  className="text-gray-300 text-sm hover:text-teal-400 transition-colors text-left"
                >
                  Trade History
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-gray-400 text-xs">
            <span>© 2018-{currentYear} Kraken.com. All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <div className="flex gap-4">
              <Link to="/terms-of-service" className="hover:text-teal-400 transition-colors">
                Terms of Service
              </Link>
              <span>|</span>
              <Link to="/privacy-policy" className="hover:text-teal-400 transition-colors">
                Privacy Terms
              </Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
