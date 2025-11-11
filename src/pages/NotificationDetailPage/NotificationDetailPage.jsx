import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

const NotificationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get notification from localStorage
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      const found = notifications.find(n => n.id === id);
      if (found) {
        setNotification(found);
        // Mark as read
        markAsRead(id);
      }
    }
    setLoading(false);
  }, [id]);

  const markAsRead = (notificationId) => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <FaCheckCircle className="text-green-400 text-3xl" />
          </div>
        );
      case "warning":
        return (
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <FaExclamationCircle className="text-yellow-400 text-3xl" />
          </div>
        );
      case "error":
        return (
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <FaExclamationCircle className="text-red-400 text-3xl" />
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FaInfoCircle className="text-blue-400 text-3xl" />
          </div>
        );
    }
  };

  const formatFullTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!notification) {
    return (
      <>
        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Notification Not Found</h1>
            <p className="text-gray-400 mb-6">This notification may have been deleted.</p>
            <button
              onClick={() => navigate("/notifications")}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Back to Notifications
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop: Show Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="min-h-screen bg-black text-white pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <button onClick={() => navigate("/notifications")} className="p-2 -ml-2">
            <FaArrowLeft className="text-xl text-white" />
          </button>
          <h1 className="text-lg font-semibold">Notification Detail</h1>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block max-w-4xl mx-auto px-6 pt-6">
          <button
            onClick={() => navigate("/notifications")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <FaArrowLeft />
            <span>Back to Notifications</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Category Badge */}
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-full">
              {notification.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-4">
            {notification.title}
          </h1>

          {/* Timestamp */}
          <p className="text-center text-gray-400 text-sm mb-8">
            {formatFullTime(notification.timestamp)}
          </p>

          {/* Divider */}
          <div className="h-px bg-gray-800 mb-8"></div>

          {/* Message Content */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 mb-6">
            <p className="text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>

          {/* Action Details (if any) */}
          {notification.type === "success" && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <FaCheckCircle />
                Success
              </h3>
              <p className="text-gray-300 text-sm">
                This action has been completed successfully. No further action is required.
              </p>
            </div>
          )}

          {notification.type === "error" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <FaExclamationCircle />
                Action Required
              </h3>
              <p className="text-gray-300 text-sm">
                Please review this notification and take necessary action. Contact support if you need assistance.
              </p>
            </div>
          )}

          {notification.type === "warning" && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                <FaExclamationCircle />
                Important
              </h3>
              <p className="text-gray-300 text-sm">
                Please review this information carefully.
              </p>
            </div>
          )}

          {notification.type === "info" && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <FaInfoCircle />
                Information
              </h3>
              <p className="text-gray-300 text-sm">
                This is for your information. No action is required at this time.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => navigate("/notifications")}
              className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              Back to Notifications
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-full py-3 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Show Bottom Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </>
  );
};

export default NotificationDetailPage;

