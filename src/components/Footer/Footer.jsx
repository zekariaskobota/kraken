import React from "react";
import Logo from "../Logo/Logo";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-white py-8 border-t border-[rgba(42,45,58,0.5)]">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        {/* Flexbox for row layout on large screens */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Company Info */}
          <div className="flex flex-col text-left w-full md:w-1/2">
            <div className="mb-4">
              <Logo size="large" showText={true} />
            </div>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed">
              Our crypto trading system offers a seamless experience for buying, selling, and managing digital currencies. With real-time market data, secure transactions, and a user-friendly interface, traders can make informed decisions and execute trades with confidence. Whether you're a beginner or an experienced trader, our platform provides all the tools you need for successful cryptocurrency trading.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h3 className="text-gray-400 font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/home" className="text-gray-400 hover:text-teal-400 transition-colors">Homepage</a></li>
              <li><a href="/market" className="text-gray-400 hover:text-teal-400 transition-colors">Market</a></li>
              <li><a href="/trade" className="text-gray-400 hover:text-teal-400 transition-colors">Trade</a></li>
              <li><a href="/news" className="text-gray-400 hover:text-teal-400 transition-colors">Get latest News</a></li>
            </ul>
          </div>

          {/* Subscribe to Newsletter */}
          <div className="w-full md:w-auto">
            <h3 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">Get the latest updates right in your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(11,14,20,0.6)] text-white border border-[#2a2d3a] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
              <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-teal-500/30">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-[rgba(42,45,58,0.5)] text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Kraken. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
