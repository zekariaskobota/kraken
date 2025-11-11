import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaCheckCircle, FaTimes, FaInfoCircle } from "react-icons/fa";

const ConfirmPopup = ({ isOpen, onClose, onConfirm, title, message, type = "warning", confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <FaExclamationTriangle className="text-amber-500 text-3xl" />;
      case "danger":
        return <FaExclamationTriangle className="text-red-500 text-3xl" />;
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "info":
        return <FaInfoCircle className="text-blue-500 text-3xl" />;
      default:
        return <FaExclamationTriangle className="text-amber-500 text-3xl" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-500 hover:bg-red-600";
      case "success":
        return "bg-green-500 hover:bg-green-600";
      case "info":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-teal-500 hover:bg-teal-600";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border border-[rgba(42,45,58,0.8)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[rgba(42,45,58,0.8)]">
                <div className="flex items-center gap-3">
                  {getIcon()}
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300 leading-relaxed">{message}</p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-[rgba(42,45,58,0.8)]">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all duration-300"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg ${getButtonColor()} text-white font-medium transition-all duration-300 shadow-lg`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmPopup;

