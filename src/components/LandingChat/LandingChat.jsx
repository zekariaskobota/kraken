import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGlobe, FaExpand, FaCheckCircle, FaQuestionCircle, FaChevronRight } from "react-icons/fa";

const LandingChat = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const faqs = [
    {
      category: "You might be looking for",
      items: [
        "Why Can't I Join Token Splash?",
        "My assets under UTA cannot be used, traded, or transferred",
        "Everything You Need to Know for Safe P2P Trading"
      ]
    },
    {
      category: "P2P Trading",
      items: [
        "How to buy crypto with P2P",
        "P2P trading fees and limits",
        "P2P dispute resolution"
      ]
    },
    {
      category: "Deposit & Withdrawal",
      items: [
        "How to deposit funds",
        "Withdrawal methods and fees",
        "Deposit and withdrawal limits"
      ]
    }
  ];

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
          />

          {/* Chat Component */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Assistant Icon */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base">Kraken Assistant: 24/7 Support</h3>
                  <p className="text-white/90 text-xs">I'm here to help! Check out the solutions below.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <FaGlobe className="text-white text-sm" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <FaExpand className="text-white text-sm" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaTimes className="text-white text-sm" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {/* Lock Account Section */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start gap-3 mb-3">
                  <FaCheckCircle className="text-teal-500 text-xl mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">Lock Account</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      If you detect suspicious or unauthorized logins, you can temporarily deactivate your Kraken account by clicking the button below.
                    </p>
                    <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* FAQs Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">FAQs</h4>
                  <Link
                    to="/help-center"
                    className="text-teal-500 hover:text-teal-600 text-sm font-medium flex items-center gap-1"
                  >
                    View All <FaChevronRight className="text-xs" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {faqs.map((faqGroup, groupIndex) => (
                    <div key={groupIndex}>
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        {faqGroup.category}
                      </p>
                      <div className="space-y-2">
                        {faqGroup.items.map((item, itemIndex) => (
                          <Link
                            key={itemIndex}
                            to="/help-center"
                            className="block p-3 bg-white border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-700 group-hover:text-teal-700 font-medium">
                                {item}
                              </p>
                              <FaQuestionCircle className="text-gray-400 group-hover:text-teal-500 text-sm" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Login Modal */}
            {!isLoggedIn && (
              <div className="bg-white border-t border-gray-200 p-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-lg"
                >
                  <p className="font-bold text-gray-900 mb-4 text-center">
                    To enhance your support experience, please log in.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg"
                    >
                      Log In
                    </Link>
                    <button
                      onClick={onClose}
                      className="w-full py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-300"
                    >
                      Proceed as Guest
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LandingChat;

