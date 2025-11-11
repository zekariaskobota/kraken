import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaMoneyBillWave, FaNewspaper, FaWallet, FaCoins } from "react-icons/fa"; 

const BottomNavigation = () => {
  const location = useLocation(); // Get the current route
  const navigate = useNavigate();

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
    <div className="md:hidden flex justify-around items-center bg-gradient-to-r from-[#0b0e14] to-[#1a1d29] py-3 pb-[calc(12px+env(safe-area-inset-bottom))] fixed bottom-0 left-0 right-0 w-full shadow-[0_-4px_12px_rgba(0,0,0,0.3)] border-t border-[rgba(42,45,58,0.5)] backdrop-blur-md z-[1000]">
      <button
        onClick={() => handleNavigation("/home")}
        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 relative min-w-0 flex-1 ${
          location.pathname === "/home" 
            ? "text-teal-400" 
            : "text-gray-400 hover:text-white hover:bg-teal-500/10"
        }`}
      >
        <FaHome className={`text-xl transition-all duration-300 ${location.pathname === "/home" ? "scale-110" : ""}`} />
        <span className="text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">Home</span>
        {location.pathname === "/home" && (
          <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-b"></span>
        )}
      </button>
      <button
        onClick={() => handleNavigation("/trade")}
        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 relative min-w-0 flex-1 ${
          location.pathname === "/trade" 
            ? "text-teal-400" 
            : "text-gray-400 hover:text-white hover:bg-teal-500/10"
        }`}
      >
        <FaMoneyBillWave className={`text-xl transition-all duration-300 ${location.pathname === "/trade" ? "scale-110" : ""}`} />
        <span className="text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">Trade</span>
        {location.pathname === "/trade" && (
          <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-b"></span>
        )}
      </button>
      <button
        onClick={() => handleNavigation("/market")}
        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 relative min-w-0 flex-1 ${
          location.pathname === "/market" 
            ? "text-teal-400" 
            : "text-gray-400 hover:text-white hover:bg-teal-500/10"
        }`}
      >
        <FaCoins className={`text-xl transition-all duration-300 ${location.pathname === "/market" ? "scale-110" : ""}`} />
        <span className="text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">Market</span>
        {location.pathname === "/market" && (
          <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-b"></span>
        )}
      </button>
      <button
        onClick={() => handleNavigation("/news")}
        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 relative min-w-0 flex-1 ${
          location.pathname === "/news" 
            ? "text-teal-400" 
            : "text-gray-400 hover:text-white hover:bg-teal-500/10"
        }`}
      >
        <FaNewspaper className={`text-xl transition-all duration-300 ${location.pathname === "/news" ? "scale-110" : ""}`} />
        <span className="text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">News</span>
        {location.pathname === "/news" && (
          <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-b"></span>
        )}
      </button>
      <button
        onClick={() => handleNavigation("/profile")}
        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 relative min-w-0 flex-1 ${
          location.pathname === "/profile" 
            ? "text-teal-400" 
            : "text-gray-400 hover:text-white hover:bg-teal-500/10"
        }`}
      >
        <FaWallet className={`text-xl transition-all duration-300 ${location.pathname === "/profile" ? "scale-110" : ""}`} />
        <span className="text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">Assets</span>
        {location.pathname === "/profile" && (
          <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-b"></span>
        )}
      </button>
    </div>
  );
};

export default BottomNavigation;