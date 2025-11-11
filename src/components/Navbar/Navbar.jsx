import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaGlobe, FaCog, FaSignOutAlt, FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import Logo from "../Logo/Logo";
import ConfirmPopup from "../ConfirmPopup/ConfirmPopup";
import { tradesAPI, depositsAPI, withdrawalsAPI, identityAPI } from "../../services/apiService";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notificationRef = useRef(null);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    // Listen for storage changes
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      setIsLoggedIn(!!newToken);
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle navigation with auth check
  const handleNavigation = (path) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    
    // Listen for storage changes (when notifications are marked as read)
    const handleStorageChange = () => {
      loadNotificationsFromStorage();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus
    const handleFocus = () => {
      loadNotificationsFromStorage();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadNotificationsFromStorage = () => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const storedNotifications = JSON.parse(stored);
        const sortedNotifications = storedNotifications
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
        setNotifications(sortedNotifications);
        setUnreadCount(storedNotifications.filter((n) => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications from storage:', error);
      }
    }
  };

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

      // Sort by timestamp (newest first)
      const sortedNotifications = generatedNotifications.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // Check localStorage for existing read status
      const stored = localStorage.getItem('notifications');
      let finalNotifications = sortedNotifications;
      
      if (stored) {
        try {
          const storedNotifications = JSON.parse(stored);
          // Merge with stored read status
          finalNotifications = sortedNotifications.map(newNotif => {
            const stored = storedNotifications.find(s => s.id === newNotif.id);
            return stored ? { ...newNotif, read: stored.read } : newNotif;
          });
        } catch (error) {
          console.error('Error parsing stored notifications:', error);
        }
      }

      // Save all to localStorage
      localStorage.setItem('notifications', JSON.stringify(finalNotifications));

      // Set only top 5 for navbar display
      const displayNotifications = finalNotifications.slice(0, 5);
      setNotifications(displayNotifications);
      setUnreadCount(finalNotifications.filter((n) => !n.read).length);
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
    
    // Update localStorage
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const storedNotifications = JSON.parse(stored);
        const updated = storedNotifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        localStorage.setItem('notifications', JSON.stringify(updated));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    
    // Update localStorage
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const storedNotifications = JSON.parse(stored);
        const updated = storedNotifications.map(n => ({ ...n, read: true }));
        localStorage.setItem('notifications', JSON.stringify(updated));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
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
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="w-full flex justify-between items-center px-4 md:px-6 py-4 bg-gradient-to-r from-[#0b0e14] to-[#1a1d29] text-white shadow-lg border-b border-[rgba(42,45,58,0.5)] sticky top-0 z-[1000] backdrop-blur-md">
      {/* Left Section - Logo & Links */}
      <div className="flex items-center gap-4 md:gap-8">
        <Logo size="default" showText={true} />

        <div className="hidden md:flex gap-2 items-center">
          <button
            onClick={() => handleNavigation("/home")}
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
          </button>
          <button
            onClick={() => handleNavigation("/trade")}
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
          </button>
          <button
            onClick={() => handleNavigation("/market")}
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
          </button>
          <button
            onClick={() => handleNavigation("/news")}
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
          </button>
          <button
            onClick={() => handleNavigation("/profile")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
              location.pathname === "/profile"
                ? "text-teal-400 bg-teal-500/15"
                : "text-gray-400 hover:text-white hover:bg-teal-500/10"
            }`}
          >
            Assets
            {location.pathname === "/profile" && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Right Section - Settings, Notifications, Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Settings Icon */}
        <button
          onClick={() => handleNavigation("/settings")}
          className="p-2 rounded-lg bg-transparent hover:bg-teal-500/10 transition-all duration-300 group"
        >
          <FaCog className="text-teal-400 text-lg group-hover:scale-110 transition-transform" />
        </button>

        {/* Notification Icon */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                navigate("/login");
                return;
              }
              // On mobile, navigate to notification page
              if (window.innerWidth < 768) {
                navigate("/notifications");
              } else {
                // On desktop, toggle dropdown
                setIsNotificationOpen(!isNotificationOpen);
              }
            }}
            className="relative p-2 rounded-lg bg-transparent hover:bg-teal-500/10 transition-all duration-300 group"
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
              {/* View All Button */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-[rgba(42,45,58,0.8)]">
                  <button
                    onClick={() => {
                      navigate("/notifications");
                      setIsNotificationOpen(false);
                    }}
                    className="w-full py-2 text-center text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors"
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Icon */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg bg-transparent hover:bg-red-500/10 transition-all duration-300 group"
        >
          <FaSignOutAlt className="text-red-400 text-lg group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Logout Confirmation Popup */}
      <ConfirmPopup
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        type="info"
        confirmText="Yes, sign out"
        cancelText="Cancel"
      />
    </nav>
  );
};

export default Navbar;
