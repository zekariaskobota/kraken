import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, handleGoogleAuth } from "../../controllers/authController";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaKey } from "react-icons/fa";
import { showToast } from "../../utils/toast";
import Logo from "../../components/Logo/Logo";
import { GOOGLE_CLIENT_ID } from "../../services/apiConfig";

const Register = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fundsPassword, setFundsPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        const clientId = GOOGLE_CLIENT_ID;
        if (clientId && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
          });
          
          // Render hidden Google button for fallback
          setTimeout(() => {
            const hiddenDiv = document.getElementById('hidden-google-button-register');
            if (hiddenDiv && window.google.accounts.id.renderButton) {
              window.google.accounts.id.renderButton(hiddenDiv, {
                theme: 'outline',
                size: 'large',
              });
            }
          }, 100);
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  const handleGoogleCallback = async (response) => {
    if (!response || !response.credential) {
      showToast.error("Failed to get Google credentials");
      return;
    }
    
    setGoogleLoading(true);
    try {
      await handleGoogleAuth(response.credential, navigate);
    } catch (error) {
      // Error is handled in handleGoogleAuth
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      showToast.error("Google Client ID is not configured. Please contact support");
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      showToast.error("Google Sign-In is loading. Please wait a moment and try again");
      return;
    }

    // Try to click the hidden Google button
    const hiddenButton = document.querySelector('#hidden-google-button-register div[role="button"]');
    if (hiddenButton) {
      hiddenButton.click();
    } else {
      // Fallback to One Tap
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Error with Google Sign-In:', error);
        showToast.error("Unable to initialize Google Sign-In. Please try again");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginPassword !== confirmPassword) {
      showToast.error("The passwords you entered do not match");
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      loginPassword,
      fundsPassword,
    };
    setLoading(true);
    await registerUser(userData, navigate);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] flex items-center justify-center p-4 md:p-6">
      {/* Hidden Google Button */}
      <div id="hidden-google-button-register" style={{ position: 'absolute', left: '-9999px', opacity: 0 }}></div>
      
      <div className="w-full max-w-2xl bg-[rgba(26,29,41,0.6)] rounded-2xl md:rounded-3xl overflow-hidden border border-[#2a2d3a] shadow-2xl">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Logo size="large" showText={true} className="justify-center" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
                Create Account
              </h1>
            </div>
            <p className="text-base text-gray-400">Join KRAKEN and start trading today</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-200" htmlFor="firstName">
                  <FaUser className="text-teal-400 text-sm" />
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-200" htmlFor="lastName">
                  <FaUser className="text-teal-400 text-sm" />
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200" htmlFor="email">
                <FaEnvelope className="text-teal-400 text-sm" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200" htmlFor="phoneNumber">
                <FaPhone className="text-teal-400 text-sm" />
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                placeholder="e.g +1 8384 8990 5364"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200" htmlFor="loginPassword">
                <FaLock className="text-teal-400 text-sm" />
                Login Password
              </label>
              <input
                type="password"
                id="loginPassword"
                placeholder="Set login password (8+ characters)"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                required
                minLength={8}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200" htmlFor="confirmPassword">
                <FaLock className="text-teal-400 text-sm" />
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200" htmlFor="fundsPassword">
                <FaKey className="text-teal-400 text-sm" />
                Funds Password
              </label>
              <input
                type="password"
                id="fundsPassword"
                placeholder="Set funds password (6-digit number)"
                value={fundsPassword}
                onChange={(e) => setFundsPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                required
                pattern="[0-9]{6}"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full px-5 py-3.5 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2d3a]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[rgba(26,29,41,0.6)] text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div className="w-full">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 text-slate-200 font-medium py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing up...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-2">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
