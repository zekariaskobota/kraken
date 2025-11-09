import React, { useState, useEffect } from "react";
import { FaTrophy, FaMedal, FaStar, FaAward, FaFire, FaChartLine } from "react-icons/fa";
import { tradesAPI, depositsAPI } from "../../services/apiService";

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    totalProfit: 0,
    totalDeposits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const [tradesData, depositsData] = await Promise.all([
        tradesAPI.getAllTrades(),
        depositsAPI.getUserDeposits(),
      ]);

      const trades = tradesData.trades || [];
      const deposits = depositsData.deposits || [];

      const completedTrades = trades.filter((t) => t.status === "Completed");
      const winningTrades = completedTrades.filter((t) => t.winLose === "Win");
      const totalProfit = completedTrades.reduce((sum, t) => {
        return sum + (t.winLose === "Win" ? t.estimatedIncome || 0 : -(t.tradingAmountUSD || 0));
      }, 0);
      const totalDeposits = deposits
        .filter((d) => d.status === "Approved")
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      setUserStats({
        totalTrades: completedTrades.length,
        winningTrades: winningTrades.length,
        totalProfit,
        totalDeposits,
      });

      // Define achievement criteria
      const allAchievements = [
        {
          id: 1,
          name: "First Trade",
          description: "Complete your first trade",
          icon: <FaStar className="text-yellow-400" />,
          unlocked: completedTrades.length >= 1,
          progress: Math.min((completedTrades.length / 1) * 100, 100),
          target: 1,
          current: completedTrades.length,
        },
        {
          id: 2,
          name: "Rising Star",
          description: "Complete 10 trades",
          icon: <FaMedal className="text-blue-400" />,
          unlocked: completedTrades.length >= 10,
          progress: Math.min((completedTrades.length / 10) * 100, 100),
          target: 10,
          current: completedTrades.length,
        },
        {
          id: 3,
          name: "Trading Master",
          description: "Complete 50 trades",
          icon: <FaTrophy className="text-purple-400" />,
          unlocked: completedTrades.length >= 50,
          progress: Math.min((completedTrades.length / 50) * 100, 100),
          target: 50,
          current: completedTrades.length,
        },
        {
          id: 4,
          name: "Win Streak",
          description: "Win 5 trades in a row",
          icon: <FaFire className="text-orange-400" />,
          unlocked: false, // Would need to track consecutive wins
          progress: 0,
          target: 5,
          current: 0,
        },
        {
          id: 5,
          name: "Profit Maker",
          description: "Earn $1,000 in profit",
          icon: <FaChartLine className="text-green-400" />,
          unlocked: totalProfit >= 1000,
          progress: Math.min((totalProfit / 1000) * 100, 100),
          target: 1000,
          current: totalProfit,
        },
        {
          id: 6,
          name: "Big Spender",
          description: "Deposit $5,000 total",
          icon: <FaAward className="text-teal-400" />,
          unlocked: totalDeposits >= 5000,
          progress: Math.min((totalDeposits / 5000) * 100, 100),
          target: 5000,
          current: totalDeposits,
        },
      ];

      setAchievements(allAchievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
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
      <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaTrophy className="text-yellow-400 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Achievements</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg border transition-all duration-300 ${
              achievement.unlocked
                ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30"
                : "bg-[rgba(11,14,20,0.6)] border-[#2a2d3a] opacity-60"
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className={achievement.unlocked ? "opacity-100" : "opacity-50"}>
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold ${achievement.unlocked ? "text-white" : "text-gray-400"}`}>
                  {achievement.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{achievement.description}</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">
                  {achievement.id === 5 || achievement.id === 6
                    ? formatCurrency(achievement.current)
                    : achievement.current}
                  /{achievement.id === 5 || achievement.id === 6 ? formatCurrency(achievement.target) : achievement.target}
                </span>
                <span className={achievement.unlocked ? "text-yellow-400" : "text-gray-500"}>
                  {achievement.progress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    achievement.unlocked
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                      : "bg-gradient-to-r from-teal-400 to-cyan-400"
                  }`}
                  style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;

