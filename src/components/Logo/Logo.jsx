import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ size = "default", showText = true, className = "" }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    default: "h-8 w-8 md:h-10 md:w-10",
    large: "h-12 w-12 md:h-16 md:w-16",
    xl: "h-20 w-20 md:h-24 md:w-24"
  };

  const textSizeClasses = {
    small: "text-sm md:text-base",
    default: "text-base md:text-lg",
    large: "text-xl md:text-2xl",
    xl: "text-2xl md:text-3xl"
  };

  const LogoContent = (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      {/* Logo Icon - Modern Crypto Trading Symbol */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Circle with Gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="logoGradientInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          
          {/* Outer Ring */}
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            opacity="0.3"
          />
          
          {/* Main Circle */}
          <circle
            cx="32"
            cy="32"
            r="24"
            fill="url(#logoGradient)"
            opacity="0.2"
          />
          
          {/* Inner Circle */}
          <circle
            cx="32"
            cy="32"
            r="18"
            fill="none"
            stroke="url(#logoGradientInner)"
            strokeWidth="2"
          />
          
          {/* Crypto Symbol - K Shape */}
          <path
            d="M 20 20 L 20 44 M 20 32 L 28 24 M 20 32 L 28 40"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Trading Arrow Up */}
          <path
            d="M 36 28 L 40 24 L 44 28"
            stroke="#14b8a6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Trading Arrow Down */}
          <path
            d="M 36 36 L 40 40 L 44 36"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Small Dots for Trading Activity */}
          <circle cx="28" cy="28" r="1.5" fill="#14b8a6" opacity="0.8" />
          <circle cx="36" cy="32" r="1.5" fill="#06b6d4" opacity="0.8" />
          <circle cx="44" cy="36" r="1.5" fill="#14b8a6" opacity="0.8" />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          KRAKEN
        </span>
      )}
    </div>
  );

  // Wrap in Link if on client pages, otherwise just return the logo
  if (showText) {
    return (
      <Link to="/home" className="transition-transform hover:scale-105">
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
};

export default Logo;

