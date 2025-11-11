import React, { useState, useEffect } from "react";
import { FaBell, FaExclamationCircle, FaInfoCircle, FaCheckCircle, FaTimes } from "react-icons/fa";
import { tradesAPI, depositsAPI, withdrawalsAPI, identityAPI } from "../../services/apiService";

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
            message: `Your deposit of $${deposit.amount?.toFixed(2) || '0.00'} has been approved and added to your account.`,
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
            message: `Your deposit of $${deposit.amount?.toFixed(2) || '0.00'} was rejected. Please contact support.`,
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
            message: `Your withdrawal of $${withdrawal.amount?.toFixed(2) || '0.00'} has been approved and processed.`,
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
            message: `Congratulations! Your ${trade.tradeType} trade on ${trade.tradePair} was successful. Profit: $${trade.estimatedIncome?.toFixed(2) || '0.00'}`,
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

      // Sort by timestamp (newest first) and limit to 10
      const sortedNotifications = generatedNotifications
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
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

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-teal-400" />;
      case "warning":
        return <FaExclamationCircle className="text-gray-400" />;
      case "error":
        return <FaExclamationCircle className="text-gray-400" />;
      default:
        return <FaInfoCircle className="text-teal-400" />;
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

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaBell className="text-teal-400 text-lg" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                notification.read
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-teal-500/10 border-teal-500/30"
              }`}
            >
              <div className="mt-0.5">{getIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-white mb-1">
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
                        Mark read
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
  );
};

export default NotificationsCenter;

