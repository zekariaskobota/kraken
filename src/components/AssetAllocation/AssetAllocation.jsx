import React, { useState, useEffect } from "react";
import { FaChartPie, FaBitcoin, FaEthereum } from "react-icons/fa";
import { tradesAPI, authAPI } from "../../services/apiService";

const AssetAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetAllocation();
  }, []);

  const fetchAssetAllocation = async () => {
    try {
      const [tradesData, profileData] = await Promise.all([
        tradesAPI.getAllTrades(),
        authAPI.getProfile(),
      ]);

      const trades = tradesData.trades || [];
      const balance = profileData.balance || 0;

      // Group by trading pair
      const pairGroups = {};
      trades.forEach((trade) => {
        const pair = trade.tradePair || "USDT";
        if (!pairGroups[pair]) {
          pairGroups[pair] = { amount: 0, count: 0 };
        }
        pairGroups[pair].amount += trade.tradingAmountUSD || 0;
        pairGroups[pair].count += 1;
      });

      // Create allocation data
      const allocationData = Object.entries(pairGroups).map(([pair, data]) => ({
        name: pair,
        value: data.amount,
        count: data.count,
        percentage: 0, // Will calculate after total
      }));

      // Add USDT balance
      if (balance > 0) {
        allocationData.push({
          name: "USDT",
          value: balance,
          count: 1,
          percentage: 0,
        });
      }

      const total = allocationData.reduce((sum, item) => sum + item.value, 0);
      setTotalValue(total);

      // Calculate percentages
      const allocationsWithPercent = allocationData.map((item) => ({
        ...item,
        percentage: total > 0 ? (item.value / total) * 100 : 0,
      }));

      setAllocations(allocationsWithPercent.sort((a, b) => b.value - a.value));
    } catch (error) {
      console.error("Error fetching asset allocation:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (name) => {
    if (name.includes("BTC")) return <FaBitcoin className="text-orange-400" />;
    if (name.includes("ETH")) return <FaEthereum className="text-blue-400" />;
    return <FaChartPie className="text-teal-400" />;
  };

  const getColor = (index) => {
    const colors = [
      "from-teal-400 to-cyan-400",
      "from-blue-400 to-indigo-400",
      "from-purple-400 to-pink-400",
      "from-orange-400 to-red-400",
      "from-green-400 to-emerald-400",
      "from-yellow-400 to-amber-400",
    ];
    return colors[index % colors.length];
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
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-slate-700/50 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaChartPie className="text-teal-400 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Asset Allocation</h3>
      </div>

      {allocations.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No assets to display</div>
      ) : (
        <>
          {/* Pie Chart Visualization */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
              <defs>
                {allocations.map((_, index) => {
                  const colors = [
                    { start: "#2dd4bf", end: "#22d3ee" },
                    { start: "#60a5fa", end: "#818cf8" },
                    { start: "#a78bfa", end: "#ec4899" },
                    { start: "#f97316", end: "#ef4444" },
                    { start: "#22c55e", end: "#10b981" },
                    { start: "#eab308", end: "#f59e0b" },
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={color.start} />
                      <stop offset="100%" stopColor={color.end} />
                    </linearGradient>
                  );
                })}
              </defs>
              {allocations.map((item, index) => {
                const startAngle = allocations
                  .slice(0, index)
                  .reduce((sum, i) => sum + (i.percentage / 100) * 360, 0);
                const angle = (item.percentage / 100) * 360;
                const largeArc = angle > 180 ? 1 : 0;

                const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 50 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                const y2 = 50 + 50 * Math.sin(((startAngle + angle) * Math.PI) / 180);

                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={`url(#gradient-${index})`}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-400">Total</div>
                <div className="text-sm font-bold text-white">{formatCurrency(totalValue)}</div>
              </div>
            </div>
          </div>

          {/* Allocation List */}
          <div className="space-y-2">
            {allocations.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getColor(index)} flex items-center justify-center text-white text-xs`}>
                    {getIcon(item.name)}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-white">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.count} {item.count === 1 ? "trade" : "trades"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-semibold text-white">{formatCurrency(item.value)}</div>
                  <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AssetAllocation;

