import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaGlobe, FaCog, FaWallet, FaSignOutAlt, FaChevronDown, FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import Logo from "../Logo/Logo";
import { tradesAPI, depositsAPI, withdrawalsAPI, identityAPI } from "../../services/apiService";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isNotificationOpen]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [tradesData, depositsData, withdrawalsData, identityData] = await Promise.all([
        tradesAPI.getAllTrades(),
        depositsAPI.getUserDeposits(),
        withdrawalsAPI.getAllWithdrawals(),
        identityAPI.getStatus().catch(() => ({ identity: null, status: null })),
      ]);

      const trades = tradesData.trades || [];
      const deposits = depositsData.deposits || [];
      const withdrawals = withdrawalsData.withdrawals || [];
      const identityStatus = identityData?.identity?.status || identityData?.status || null;

      const generatedNotifications = [];

      // Generate notifications from identity verification
      if (identityStatus) {
        if (identityStatus === "Verified") {
          generatedNotifications.push({
            id: `identity-verified`,
            type: "success",
            title: "Identity Verified",
            message: "Congratulations! Your identity verification has been approved. Your account is now fully verified.",
            timestamp: new Date(identityData?.identity?.updatedAt || identityData?.updatedAt || Date.now()),
            read: false,
          });
        } else if (identityStatus === "Pending") {
          generatedNotifications.push({
            id: `identity-pending`,
            type: "info",
            title: "Identity Verification Pending",
            message: "Your identity verification request is under review. We'll notify you once it's processed.",
            timestamp: new Date(identityData?.identity?.createdAt || identityData?.createdAt || Date.now()),
            read: false,
          });
        } else if (identityStatus === "Rejected") {
          generatedNotifications.push({
            id: `identity-rejected`,
            type: "error",
            title: "Identity Verification Rejected",
            message: "Your identity verification was rejected. Please resubmit with correct documents or contact support.",
            timestamp: new Date(identityData?.identity?.updatedAt || identityData?.updatedAt || Date.now()),
            read: false,
          });
        }
      }

      // Generate notifications from deposits
      deposits.slice(0, 5).forEach((deposit) => {
        if (deposit.status === "Approved") {
          generatedNotifications.push({
            id: `deposit-${deposit._id}`,
            type: "success",
            title: "Deposit Approved",
            message: `Your deposit of $${deposit.amount?.toFixed(2) || '0.00'} has been approved.`,
            timestamp: new Date(deposit.createdAt || deposit.updatedAt),
            read: false,
          });
        } else if (deposit.status === "Pending") {
          generatedNotifications.push({
            id: `deposit-pending-${deposit._id}`,
            type: "info",
            title: "Deposit Pending",
            message: `Your deposit of $${deposit.amount?.toFixed(2) || '0.00'} is being processed.`,
            timestamp: new Date(deposit.createdAt),
            read: false,
          });
        } else if (deposit.status === "Rejected") {
          generatedNotifications.push({
            id: `deposit-rejected-${deposit._id}`,
            type: "error",
            title: "Deposit Rejected",
            message: `Your deposit of $${deposit.amount?.toFixed(2) || '0.00'} was rejected.`,
            timestamp: new Date(deposit.updatedAt || deposit.createdAt),
            read: false,
          });
        }
      });

      // Generate notifications from withdrawals
      withdrawals.slice(0, 5).forEach((withdrawal) => {
        if (withdrawal.status === "Approved") {
          generatedNotifications.push({
            id: `withdrawal-${withdrawal._id}`,
            type: "success",
            title: "Withdrawal Approved",
            message: `Your withdrawal of $${withdrawal.amount?.toFixed(2) || '0.00'} has been processed.`,
            timestamp: new Date(withdrawal.createdAt || withdrawal.updatedAt),
            read: false,
          });
        } else if (withdrawal.status === "Pending") {
          generatedNotifications.push({
            id: `withdrawal-pending-${withdrawal._id}`,
            type: "info",
            title: "Withdrawal Pending",
            message: `Your withdrawal of $${withdrawal.amount?.toFixed(2) || '0.00'} is being processed.`,
            timestamp: new Date(withdrawal.createdAt),
            read: false,
          });
        }
      });

      // Generate notifications from completed trades
      const completedTrades = trades.filter((t) => t.status === "Completed").slice(0, 5);
      completedTrades.forEach((trade) => {
        if (trade.winLose === "Win") {
          generatedNotifications.push({
            id: `trade-win-${trade._id}`,
            type: "success",
            title: "Trade Won",
            message: `Your ${trade.tradeType} trade on ${trade.tradePair} was successful.`,
            timestamp: new Date(trade.updatedAt || trade.createdAt),
            read: false,
          });
        } else if (trade.winLose === "Lose") {
          generatedNotifications.push({
            id: `trade-lose-${trade._id}`,
            type: "warning",
            title: "Trade Closed",
            message: `Your ${trade.tradeType} trade on ${trade.tradePair} was closed.`,
            timestamp: new Date(trade.updatedAt || trade.createdAt),
            read: false,
          });
        }
      });

      // Sort by timestamp (newest first) and limit to 5
      const sortedNotifications = generatedNotifications
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!notifications.find((n) => n.id === id)?.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-400" />;
      case "warning":
        return <FaExclamationCircle className="text-yellow-400" />;
      case "error":
        return <FaExclamationCircle className="text-red-400" />;
      default:
        return <FaInfoCircle className="text-blue-400" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Cancel',
      background: '#0f172a',
      color: '#e5e7eb',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    });
    setIsDropdownOpen(false);
  };

  const handleSettings = () => {
    navigate("/profile?section=settings");
    setIsDropdownOpen(false);
  };

  const handleAssets = () => {
    navigate("/profile?section=assets");
    setIsDropdownOpen(false);
  };

  return (
    <nav className="w-full flex justify-between items-center px-4 md:px-6 py-4 bg-gradient-to-r from-[#0b0e14] to-[#1a1d29] text-white shadow-lg border-b border-[rgba(42,45,58,0.5)] sticky top-0 z-[1000] backdrop-blur-md">
      {/* Left Section - Logo & Links */}
      <div className="flex items-center gap-4 md:gap-8">
        <Logo size="default" showText={true} />

        <div className="hidden md:flex gap-2 items-center">
          <Link
            to="/home"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
              location.pathname === "/home"
                ? "text-teal-400 bg-teal-500/15"
                : "text-gray-400 hover:text-white hover:bg-teal-500/10"
            }`}
          >
            Home
            {location.pathname === "/home" && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></span>
            )}
          </Link>
          <Link
            to="/trade"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
              location.pathname === "/trade"
                ? "text-teal-400 bg-teal-500/15"
                : "text-gray-400 hover:text-white hover:bg-teal-500/10"
            }`}
          >
            Trade
            {location.pathname === "/trade" && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></span>
            )}
          </Link>
          <Link
            to="/market"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
              location.pathname === "/market"
                ? "text-teal-400 bg-teal-500/15"
                : "text-gray-400 hover:text-white hover:bg-teal-500/10"
            }`}
          >
            Market
            {location.pathname === "/market" && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></span>
            )}
          </Link>
          <Link
            to="/news"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
              location.pathname === "/news"
                ? "text-teal-400 bg-teal-500/15"
                : "text-gray-400 hover:text-white hover:bg-teal-500/10"
            }`}
          >
            News
            {location.pathname === "/news" && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></span>
            )}
          </Link>
          <Link
            to="/demo"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
              location.pathname === "/demo"
                ? "text-teal-400 bg-teal-500/15"
                : "text-gray-400 hover:text-white hover:bg-teal-500/10"
            }`}
          >
            Demo
            {location.pathname === "/demo" && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></span>
            )}
          </Link>
        </div>
      </div>

      {/* Right Section - Notifications, Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notification Icon */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all duration-300 group"
          >
            <FaBell className="text-teal-400 text-lg group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border border-[rgba(42,45,58,0.8)] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-[rgba(42,45,58,0.8)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
              <div className="py-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 mx-2 rounded-lg border transition-all duration-300 ${
                        notification.read
                          ? "bg-[rgba(11,14,20,0.6)] border-[#2a2d3a]"
                          : "bg-teal-500/10 border-teal-500/30"
                      }`}
                    >
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-white mb-1">
                              {notification.title}
                            </div>
                            <div className="text-xs text-gray-400 mb-1">{notification.message}</div>
                            <div className="text-xs text-gray-500">{formatTime(notification.timestamp)}</div>
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 group"
          >
            <img
              src="/profile.png"
              alt="Profile"
              className="h-9 w-9 md:h-10 md:w-10 rounded-full cursor-pointer border-2 border-transparent transition-all duration-300 object-cover group-hover:border-teal-400 group-hover:scale-110"
            />
            <FaChevronDown
              className={`text-gray-400 text-xs transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border border-[rgba(42,45,58,0.8)] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
              <div className="py-1">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200 transition-colors"
                >
                  <FaCog className="text-base" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleAssets}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200 transition-colors"
                >
                  <FaWallet className="text-base" />
                  <span>Assets</span>
                </button>
                <div className="border-t border-[rgba(42,45,58,0.8)] my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 transition-colors"
                >
                  <FaSignOutAlt className="text-base" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
