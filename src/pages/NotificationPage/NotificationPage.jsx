import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaCog, FaChevronRight, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import { tradesAPI, depositsAPI, withdrawalsAPI, identityAPI } from "../../services/apiService";

const NotificationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Refresh when coming back from detail page
    const handleFocus = () => {
      loadNotificationsFromStorage();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadNotificationsFromStorage = () => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const storedNotifications = JSON.parse(stored);
        setNotifications(storedNotifications);
      } catch (error) {
        console.error('Error loading notifications from storage:', error);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
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

      // Identity notifications
      if (identityStatus) {
        if (identityStatus === "Verified") {
          generatedNotifications.push({
            id: `identity-verified`,
            type: "success",
            category: "System Notification",
            title: "Identity Verified",
            message: "Congratulations! Your identity verification has been approved. Your account is now fully verified and you can access all features.",
            timestamp: new Date(identityData?.identity?.updatedAt || identityData?.updatedAt || Date.now()),
            read: false,
          });
        } else if (identityStatus === "Pending") {
          generatedNotifications.push({
            id: `identity-pending`,
            type: "info",
            category: "System Notification",
            title: "Identity Verification Pending",
            message: "Your identity verification request is under review. We'll notify you once it's processed. This usually takes 24-48 hours.",
            timestamp: new Date(identityData?.identity?.createdAt || identityData?.createdAt || Date.now()),
            read: false,
          });
        } else if (identityStatus === "Rejected") {
          generatedNotifications.push({
            id: `identity-rejected`,
            type: "error",
            category: "System Notification",
            title: "Identity Verification Rejected",
            message: "Your identity verification was rejected. Please resubmit with correct documents or contact support for assistance.",
            timestamp: new Date(identityData?.identity?.updatedAt || identityData?.updatedAt || Date.now()),
            read: false,
          });
        }
      }

      // Deposit notifications
      deposits.slice(0, 10).forEach((deposit) => {
        if (deposit.status === "Approved") {
          generatedNotifications.push({
            id: `deposit-${deposit._id}`,
            type: "success",
            category: "Latest Events",
            title: "Deposit Approved",
            message: `Your deposit of ${deposit.amount?.toFixed(2)} USDT has been successfully processed and credited to your account.`,
            timestamp: new Date(deposit.createdAt || deposit.updatedAt),
            read: false,
          });
        } else if (deposit.status === "Pending") {
          generatedNotifications.push({
            id: `deposit-pending-${deposit._id}`,
            type: "info",
            category: "Latest Events",
            title: "Deposit Processing",
            message: `Your deposit of ${deposit.amount?.toFixed(2)} USDT is being processed. We'll notify you once it's completed.`,
            timestamp: new Date(deposit.createdAt),
            read: false,
          });
        } else if (deposit.status === "Rejected") {
          generatedNotifications.push({
            id: `deposit-rejected-${deposit._id}`,
            type: "error",
            category: "Latest Events",
            title: "Deposit Rejected",
            message: `Your deposit of ${deposit.amount?.toFixed(2)} USDT was rejected. Please contact support for more information.`,
            timestamp: new Date(deposit.updatedAt || deposit.createdAt),
            read: false,
          });
        }
      });

      // Withdrawal notifications
      withdrawals.slice(0, 10).forEach((withdrawal) => {
        if (withdrawal.status === "Approved") {
          generatedNotifications.push({
            id: `withdrawal-${withdrawal._id}`,
            type: "success",
            category: "Latest Events",
            title: "Withdrawal Completed",
            message: `Your withdrawal of ${withdrawal.amount?.toFixed(2)} USDT has been successfully processed.`,
            timestamp: new Date(withdrawal.createdAt || withdrawal.updatedAt),
            read: false,
          });
        } else if (withdrawal.status === "Pending") {
          generatedNotifications.push({
            id: `withdrawal-pending-${withdrawal._id}`,
            type: "info",
            category: "Latest Events",
            title: "Withdrawal Processing",
            message: `Your withdrawal of ${withdrawal.amount?.toFixed(2)} USDT is being processed. Please wait for confirmation.`,
            timestamp: new Date(withdrawal.createdAt),
            read: false,
          });
        }
      });

      // Trade notifications (completed trades)
      const completedTrades = trades.filter((t) => t.status === "Completed").slice(0, 10);
      completedTrades.forEach((trade) => {
        if (trade.winLose === "Win") {
          generatedNotifications.push({
            id: `trade-win-${trade._id}`,
            type: "success",
            category: "Latest Events",
            title: "Trade Won 🎉",
            message: `Your ${trade.tradeType} trade on ${trade.tradePair} was successful. Profit: ${trade.profit?.toFixed(2)} USDT`,
            timestamp: new Date(trade.updatedAt || trade.createdAt),
            read: false,
          });
        } else if (trade.winLose === "Lose") {
          generatedNotifications.push({
            id: `trade-lose-${trade._id}`,
            type: "warning",
            category: "Latest Events",
            title: "Trade Closed",
            message: `Your ${trade.tradeType} trade on ${trade.tradePair} was closed. Loss: ${trade.profit?.toFixed(2)} USDT`,
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

      setNotifications(finalNotifications);
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(finalNotifications));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-400 text-xl" />;
      case "warning":
        return <FaExclamationCircle className="text-yellow-400 text-xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-400 text-xl" />;
      default:
        return <FaInfoCircle className="text-blue-400 text-xl" />;
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
    if (minutes < 60) return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    if (hours < 24) return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    if (days === 1) return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const filterNotifications = () => {
    switch (activeTab) {
      case "system":
        return notifications.filter(n => n.category === "System Notification");
      case "events":
        return notifications.filter(n => n.category === "Latest Events");
      case "announcements":
        return notifications.filter(n => n.category === "Announcement");
      default:
        return notifications;
    }
  };

  const filteredNotifications = filterNotifications();
  const systemCount = notifications.filter(n => n.category === "System Notification").length;
  const eventsCount = notifications.filter(n => n.category === "Latest Events").length;
  const announcementsCount = notifications.filter(n => n.category === "Announcement").length;

  return (
    <>
      {/* Desktop: Show Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="min-h-screen bg-black text-white pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <FaArrowLeft className="text-xl text-white" />
          </button>
          <h1 className="text-lg font-semibold">Notification</h1>
          <div className="flex items-center gap-3">
            <button className="p-2">
              <FaCalendarAlt className="text-xl text-white" />
            </button>
            <button className="p-2">
              <FaCog className="text-xl text-white" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block max-w-7xl mx-auto px-6 pt-6">
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400 text-sm">Stay updated with your latest activities</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 px-4 md:max-w-7xl md:mx-auto md:px-6 md:mt-6">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === "all"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              All {notifications.length}
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === "system"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              System Notification {systemCount}
              {activeTab === "system" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === "events"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Latest Events {eventsCount}
              {activeTab === "events" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === "announcements"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Announcement {announcementsCount}
              {activeTab === "announcements" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="md:max-w-7xl md:mx-auto md:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-lg mb-2">No notifications</div>
              <div className="text-gray-500 text-sm">You're all caught up!</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => navigate(`/notifications/${notification.id}`)}
                  className="px-4 md:px-0 py-4 hover:bg-gray-900/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Red dot indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    )}
                    {notification.read && (
                      <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 flex-shrink-0"></div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-white font-medium text-base mb-1">
                        {notification.title}
                      </h3>

                      {/* Message */}
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs">
                            {formatTime(notification.timestamp)}
                          </span>
                          <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                            {notification.category}
                          </span>
                        </div>
                        <FaChevronRight className="text-gray-400 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Show Bottom Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
};

export default NotificationPage;

