import React, { useState } from "react";
import axios from "axios";
import { FaKey, FaLock, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import config from "../../config";
import Swal from "sweetalert2";

const ChangePassword = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setMessage("");
    setShowPasswords({ oldPassword: false, newPassword: false, confirmPassword: false });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.BACKEND_URL}/api/auth/change-password`,
        { ...formData, type: activeTab },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message,
        confirmButtonColor: "#22c55e",
      });
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ oldPassword: false, newPassword: false, confirmPassword: false });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "An error occurred",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full p-0 flex flex-col gap-6 box-border overflow-x-hidden">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-[rgba(26,29,41,0.9)] via-[rgba(11,14,20,0.8)] to-[rgba(26,29,41,0.9)] border border-[rgba(42,45,58,0.6)] rounded-2xl p-8 md:p-6 sm:p-5 text-center overflow-hidden shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(38,166,154,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-20 h-20 md:w-16 md:h-16 sm:w-14 sm:h-14 mx-auto bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border-2 border-teal-500/30 shadow-xl">
              <FaShieldAlt className="text-3xl md:text-2xl sm:text-xl text-teal-400" />
            </div>
          </div>
          <h2 className="text-2xl md:text-xl sm:text-lg font-bold text-white mb-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
            Change Password
          </h2>
          <p className="text-sm md:text-xs text-gray-400 m-0">
            Secure your account by updating your password
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-1.5 overflow-x-auto overflow-y-hidden -webkit-overflow-scrolling-touch scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-[rgba(42,45,58,0.3)] shadow-lg">
        <button
          onClick={() => handleTabClick("login")}
          className={`group relative flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-3.5 md:px-5 md:py-3 rounded-lg transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
            activeTab === "login"
              ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30 border border-transparent"
              : "bg-transparent text-gray-400 hover:text-gray-300 hover:bg-teal-500/10 border border-transparent"
          }`}
        >
          {activeTab === "login" && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-lg"></div>
          )}
          <FaLock className={`text-base ${activeTab === "login" ? "text-white" : "text-gray-400"}`} />
          <span className={`text-sm font-semibold ${activeTab === "login" ? "text-white" : "text-gray-400"}`}>
            Login Password
          </span>
        </button>
        <button
          onClick={() => handleTabClick("transaction")}
          className={`group relative flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-3.5 md:px-5 md:py-3 rounded-lg transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
            activeTab === "transaction"
              ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30 border border-transparent"
              : "bg-transparent text-gray-400 hover:text-gray-300 hover:bg-teal-500/10 border border-transparent"
          }`}
        >
          {activeTab === "transaction" && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-lg"></div>
          )}
          <FaKey className={`text-base ${activeTab === "transaction" ? "text-white" : "text-gray-400"}`} />
          <span className={`text-sm font-semibold ${activeTab === "transaction" ? "text-white" : "text-gray-400"}`}>
            Transaction Password
          </span>
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-8 md:p-6 sm:p-5 flex flex-col gap-6 shadow-xl"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300 font-semibold flex items-center gap-2">
            <FaLock className="text-xs text-teal-400" />
            {activeTab === "login"
              ? "Current Login Password"
              : "Current Transaction Password"}
          </label>
          <div className="relative">
            <input
              type={showPasswords.oldPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.8)] border border-[#2a2d3a] rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.9)] focus:ring-2 focus:ring-teal-500/20 placeholder:text-gray-600 pr-12"
              placeholder={
                activeTab === "login"
                  ? "Enter your current password"
                  : "Enter your current transaction password"
              }
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("oldPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPasswords.oldPassword ? (
                <FaEyeSlash className="text-base" />
              ) : (
                <FaEye className="text-base" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300 font-semibold flex items-center gap-2">
            <FaKey className="text-xs text-teal-400" />
            {activeTab === "login"
              ? "New Login Password"
              : "New Transaction Password"}
          </label>
          <div className="relative">
            <input
              type={showPasswords.newPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.8)] border border-[#2a2d3a] rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.9)] focus:ring-2 focus:ring-teal-500/20 placeholder:text-gray-600 pr-12"
              placeholder={
                activeTab === "login"
                  ? "Enter new password (8+ characters)"
                  : "Enter new transaction password"
              }
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("newPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPasswords.newPassword ? (
                <FaEyeSlash className="text-base" />
              ) : (
                <FaEye className="text-base" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300 font-semibold flex items-center gap-2">
            <FaShieldAlt className="text-xs text-teal-400" />
            {activeTab === "login"
              ? "Confirm New Password"
              : "Confirm Transaction Password"}
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-[rgba(11,14,20,0.8)] border border-[#2a2d3a] rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.9)] focus:ring-2 focus:ring-teal-500/20 placeholder:text-gray-600 pr-12"
              placeholder={
                activeTab === "login"
                  ? "Re-enter new password"
                  : "Re-enter new transaction password"
              }
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirmPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPasswords.confirmPassword ? (
                <FaEyeSlash className="text-base" />
              ) : (
                <FaEye className="text-base" />
              )}
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3">
            <p className="text-center text-blue-400 text-sm m-0">{message}</p>
          </div>
        )}

        <button
          type="submit"
          className="group relative overflow-hidden w-full px-5 py-4 rounded-xl text-base font-semibold text-white border-none cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
          disabled={loading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="text-sm">Processing...</span>
            </>
          ) : (
            <>
              <FaShieldAlt className="text-base" />
              <span>Update Password</span>
            </>
          )}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ChangePassword;
