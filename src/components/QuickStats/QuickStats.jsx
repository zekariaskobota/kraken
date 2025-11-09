import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp, FaDollarSign, FaChartBar } from "react-icons/fa";
import { tradesAPI, depositsAPI, withdrawalsAPI, authAPI } from "../../services/apiService";

const QuickStats = () => {
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    tradingVolume: 0,
    roi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [tradesData, depositsData, withdrawalsData, profileData] = await Promise.all([
        tradesAPI.getAllTrades(),
        depositsAPI.getUserDeposits(),
        withdrawalsAPI.getAllWithdrawals(),
        authAPI.getProfile(),
      ]);

      const trades = tradesData.trades || [];
      const deposits = depositsData.deposits || [];
      const withdrawals = withdrawalsData.withdrawals || [];

      const totalDeposits = deposits
        .filter((d) => d.status === "Approved")
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const totalWithdrawals = withdrawals
        .filter((w) => w.status === "Approved")
        .reduce((sum, w) => sum + (w.amount || 0), 0);

      const tradingVolume = trades.reduce((sum, t) => sum + (t.tradingAmountUSD || 0), 0);

      const completedTrades = trades.filter((t) => t.status === "Completed");
      const totalProfit = completedTrades.reduce((sum, t) => {
        return sum + (t.winLose === "Win" ? t.estimatedIncome || 0 : -(t.tradingAmountUSD || 0));
      }, 0);

      const roi = totalDeposits > 0 ? ((totalProfit / totalDeposits) * 100) : 0;

      setStats({
        totalDeposits,
        totalWithdrawals,
        tradingVolume,
        roi: Math.round(roi * 10) / 10,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-700/50 rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-slate-700/50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: <FaArrowDown className="text-green-400" />,
      label: "Total Deposits",
      value: formatCurrency(stats.totalDeposits),
      color: "text-green-400",
      bg: "from-green-500/10 to-emerald-500/5",
    },
    {
      icon: <FaArrowUp className="text-red-400" />,
      label: "Total Withdrawals",
      value: formatCurrency(stats.totalWithdrawals),
      color: "text-red-400",
      bg: "from-red-500/10 to-orange-500/5",
    },
    {
      icon: <FaChartBar className="text-blue-400" />,
      label: "Trading Volume",
      value: formatCurrency(stats.tradingVolume),
      color: "text-blue-400",
      bg: "from-blue-500/10 to-cyan-500/5",
    },
    {
      icon: <FaDollarSign className="text-purple-400" />,
      label: "ROI",
      value: `${stats.roi >= 0 ? "+" : ""}${stats.roi}%`,
      color: stats.roi >= 0 ? "text-green-400" : "text-red-400",
      bg: stats.roi >= 0 ? "from-green-500/10 to-emerald-500/5" : "from-red-500/10 to-orange-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-3 sm:p-4 hover:border-teal-500/50 transition-all duration-300"
        >
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-2`}>
            {stat.icon}
          </div>
          <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
          <div className={`text-base sm:text-lg font-semibold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;

