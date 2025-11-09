import React, { useState, useEffect } from "react";
import { FaChartLine, FaArrowUp, FaArrowDown, FaTrophy } from "react-icons/fa";
import { tradesAPI, depositsAPI, withdrawalsAPI } from "../../services/apiService";

const PortfolioPerformance = () => {
  const [stats, setStats] = useState({
    totalProfit: 0,
    profit24h: 0,
    profit7d: 0,
    profit30d: 0,
    winRate: 0,
    totalTrades: 0,
    winningTrades: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioStats();
  }, []);

  const fetchPortfolioStats = async () => {
    try {
      const [tradesData, depositsData, withdrawalsData] = await Promise.all([
        tradesAPI.getAllTrades(),
        depositsAPI.getUserDeposits(),
        withdrawalsAPI.getAllWithdrawals(),
      ]);

      const trades = tradesData.trades || [];
      const deposits = depositsData.deposits || [];
      const withdrawals = withdrawalsData.withdrawals || [];

      // Calculate stats
      const completedTrades = trades.filter((t) => t.status === "Completed");
      const winningTrades = completedTrades.filter((t) => t.winLose === "Win");
      const totalProfit = completedTrades.reduce((sum, t) => {
        return sum + (t.winLose === "Win" ? t.estimatedIncome || 0 : -(t.tradingAmountUSD || 0));
      }, 0);

      const now = new Date();
      const last24h = new Date(now - 24 * 60 * 60 * 1000);
      const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

      const profit24h = completedTrades
        .filter((t) => new Date(t.createdAt) >= last24h)
        .reduce((sum, t) => sum + (t.winLose === "Win" ? t.estimatedIncome || 0 : -(t.tradingAmountUSD || 0)), 0);

      const profit7d = completedTrades
        .filter((t) => new Date(t.createdAt) >= last7d)
        .reduce((sum, t) => sum + (t.winLose === "Win" ? t.estimatedIncome || 0 : -(t.tradingAmountUSD || 0)), 0);

      const profit30d = completedTrades
        .filter((t) => new Date(t.createdAt) >= last30d)
        .reduce((sum, t) => sum + (t.winLose === "Win" ? t.estimatedIncome || 0 : -(t.tradingAmountUSD || 0)), 0);

      const winRate = completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0;

      setStats({
        totalProfit,
        profit24h,
        profit7d,
        profit30d,
        winRate: Math.round(winRate * 10) / 10,
        totalTrades: completedTrades.length,
        winningTrades: winningTrades.length,
      });
    } catch (error) {
      console.error("Error fetching portfolio stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-12 bg-slate-700/50 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-700/50 rounded"></div>
            <div className="h-20 bg-slate-700/50 rounded"></div>
            <div className="h-20 bg-slate-700/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaChartLine className="text-teal-400 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Portfolio Performance</h3>
      </div>

      {/* Total Profit/Loss */}
      <div className="mb-6">
        <div className="text-xs text-gray-400 mb-1">Total P&L</div>
        <div className={`text-2xl sm:text-3xl font-bold ${stats.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
          {formatCurrency(stats.totalProfit)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.totalTrades} trades • {stats.winningTrades} wins
        </div>
      </div>

      {/* Time Period Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[rgba(11,14,20,0.6)] rounded-lg p-3 border border-[#2a2d3a]">
          <div className="text-xs text-gray-400 mb-1">24h</div>
          <div className={`text-sm font-semibold flex items-center gap-1 ${stats.profit24h >= 0 ? "text-green-400" : "text-red-400"}`}>
            {stats.profit24h >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
            {formatCurrency(Math.abs(stats.profit24h))}
          </div>
        </div>
        <div className="bg-[rgba(11,14,20,0.6)] rounded-lg p-3 border border-[#2a2d3a]">
          <div className="text-xs text-gray-400 mb-1">7d</div>
          <div className={`text-sm font-semibold flex items-center gap-1 ${stats.profit7d >= 0 ? "text-green-400" : "text-red-400"}`}>
            {stats.profit7d >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
            {formatCurrency(Math.abs(stats.profit7d))}
          </div>
        </div>
        <div className="bg-[rgba(11,14,20,0.6)] rounded-lg p-3 border border-[#2a2d3a]">
          <div className="text-xs text-gray-400 mb-1">30d</div>
          <div className={`text-sm font-semibold flex items-center gap-1 ${stats.profit30d >= 0 ? "text-green-400" : "text-red-400"}`}>
            {stats.profit30d >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
            {formatCurrency(Math.abs(stats.profit30d))}
          </div>
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-[rgba(11,14,20,0.6)] rounded-lg p-3 border border-[#2a2d3a]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaTrophy className="text-yellow-400 text-sm" />
            <span className="text-xs text-gray-400">Win Rate</span>
          </div>
          <span className="text-sm font-semibold text-white">{stats.winRate}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(stats.winRate, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPerformance;

