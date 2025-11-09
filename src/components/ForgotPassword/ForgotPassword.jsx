import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import config from "../../config";
import Swal from 'sweetalert2';
import { FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      email,
      newPassword,
    };

    try {
      const response = await fetch(`${config.BACKEND_URL}/api/auth/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Password Reset Successful',
          text: 'You can now log in with your new password.',
          confirmButtonColor: '#26a69a',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Information',
          text: data.message,
          confirmButtonColor: '#26a69a',
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Password Reset Failed',
        text: 'Failed to reset password. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <Link to="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors mb-6">
            <FaArrowLeft className="text-xs" />
            Back to Login
          </Link>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-full mb-4">
              <FaLock className="text-teal-400" size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-sm text-gray-400">Enter your email and new password to reset</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2" htmlFor="email">
                <FaEnvelope className="text-xs text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2" htmlFor="newPassword">
                <FaLock className="text-xs text-gray-400" />
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password (8+ characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
