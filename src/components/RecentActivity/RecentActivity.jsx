import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp, FaExchangeAlt, FaClock } from "react-icons/fa";
import { tradesAPI, depositsAPI, withdrawalsAPI } from "../../services/apiService";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const [tradesData, depositsData, withdrawalsData] = await Promise.all([
        tradesAPI.getAllTrades(),
        depositsAPI.getUserDeposits(),
        withdrawalsAPI.getAllWithdrawals(),
      ]);

      const trades = (tradesData.trades || []).map((t) => ({
        type: "trade",
        id: t._id,
        title: `${t.tradeType} ${t.tradePair}`,
        amount: t.tradingAmountUSD,
        status: t.status,
        winLose: t.winLose,
        timestamp: t.createdAt,
        icon: <FaExchangeAlt />,
        color: t.winLose === "Win" ? "text-green-400" : t.winLose === "Lose" ? "text-red-400" : "text-gray-400",
      }));

      const deposits = (depositsData.deposits || []).map((d) => ({
        type: "deposit",
        id: d._id,
        title: "Deposit",
        amount: d.amount,
        status: d.status,
        timestamp: d.createdAt,
        icon: <FaArrowDown />,
        color: "text-green-400",
      }));

      const withdrawals = (withdrawalsData.withdrawals || []).map((w) => ({
        type: "withdrawal",
        id: w._id,
        title: "Withdrawal",
        amount: w.amount,
        status: w.status,
        timestamp: w.createdAt,
        icon: <FaArrowUp />,
        color: "text-red-400",
      }));

      const allActivities = [...trades, ...deposits, ...withdrawals]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
      case "Completed":
        return "text-green-400";
      case "Pending":
      case "Processing":
        return "text-yellow-400";
      case "Rejected":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white">Recent Activity</h3>
        <FaClock className="text-gray-400 text-sm" />
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a] hover:border-teal-500/50 transition-all duration-300"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/10 flex items-center justify-center ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-medium text-white truncate">{activity.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${activity.color} font-semibold`}>{formatCurrency(activity.amount)}</span>
                  <span className={`text-xs ${getStatusColor(activity.status)}`}>• {activity.status}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">{formatTime(activity.timestamp)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

