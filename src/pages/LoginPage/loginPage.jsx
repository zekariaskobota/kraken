import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, handleGoogleAuth } from "../../controllers/authController";
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaChartLine, FaBolt, FaShieldAlt } from "react-icons/fa";
import Logo from "../../components/Logo/Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Load Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleGoogleCallback = async (response) => {
    if (!response.credential) {
      Swal.fire({
        icon: 'error',
        title: 'Google Sign-In Error',
        text: 'Failed to get Google credentials.',
      });
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
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      Swal.fire({
        icon: 'error',
        title: 'Google Sign-In Error',
        text: 'Google Sign-In is not available. Please check your configuration.',
      });
      return;
    }

    // Trigger Google One Tap sign-in
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // If One Tap is not available, show a message
        Swal.fire({
          icon: 'info',
          title: 'Google Sign-In',
          text: 'Please allow popups or try again. You can also use email/password to sign in.',
          confirmButtonText: 'OK'
        });
      }
    });
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = { email, loginPassword };

    try {
      await loginUser(userData, navigate);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error?.message || 'Something went wrong!',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Left Side - Login Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl">
            <div className="text-center mb-10 animate-fade-in">
              <div className="flex justify-center mb-6">
                <Logo size="large" showText={true} className="justify-center" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-lg text-slate-300 font-medium">Sign in to access your KRAKEN account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="email">
                  <FaEnvelope className="text-cyan-400 text-sm" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="password">
                  <FaLock className="text-cyan-400 text-sm" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 backdrop-blur-sm pr-14"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-slate-700/30"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/resetPassword" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full px-5 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center gap-2"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/90 text-slate-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full px-5 py-4 rounded-xl text-base font-semibold text-white bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 backdrop-blur-sm"
              >
                {googleLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-slate-400">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                By signing in, you agree to our{' '}
                <Link to="/terms-of-service" className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms of Service</Link> and{' '}
                <Link to="/privacy-policy" className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="hidden lg:flex bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-blue-500/10 p-12 items-center justify-center border-l border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
            <div className="max-w-md relative z-10">
              <h2 className="text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Trade Smarter
              </h2>
              <p className="text-lg text-slate-300 mb-12 font-medium">Professional trading platform with cutting-edge tools</p>
              <div className="flex flex-col gap-8">
                <div className="flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-cyan-500/30">
                    <FaChartLine className="text-cyan-400 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Advanced Charts</h3>
                    <p className="text-slate-400 leading-relaxed">Real-time market analysis with professional-grade charting tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-cyan-500/30">
                    <FaBolt className="text-cyan-400 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Fast Execution</h3>
                    <p className="text-slate-400 leading-relaxed">Lightning-fast order processing with minimal latency</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-cyan-500/30">
                    <FaShieldAlt className="text-cyan-400 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Secure Platform</h3>
                    <p className="text-slate-400 leading-relaxed">Bank-level security with advanced encryption protocols</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
