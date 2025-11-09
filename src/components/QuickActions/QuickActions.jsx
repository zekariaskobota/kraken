import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp, FaExchangeAlt, FaStar, FaFire } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { tradesAPI } from "../../services/apiService";

const QuickActions = () => {
  const navigate = useNavigate();
  const [favoritePairs, setFavoritePairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoritePairs();
  }, []);

  const fetchFavoritePairs = async () => {
    try {
      const tradesData = await tradesAPI.getAllTrades();
      const trades = tradesData.trades || [];

      // Count trades by pair
      const pairCounts = {};
      trades.forEach((trade) => {
        const pair = trade.tradePair || "BTC/USDT";
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      });

      // Get top 3 most traded pairs
      const topPairs = Object.entries(pairCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([pair]) => pair);

      if (topPairs.length > 0) {
        // Fetch current prices from Binance
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const marketData = await response.json();

        const pairsWithPrices = topPairs.map((pair) => {
          const symbol = pair.replace('/', '');
          const marketInfo = marketData.find((coin) => coin.symbol === symbol);
          
          if (marketInfo) {
            return {
              symbol: pair,
              change: parseFloat(marketInfo.priceChangePercent || 0),
            };
          }
          return null;
        }).filter(Boolean);

        setFavoritePairs(pairsWithPrices);
      } else {
        // If no trades, show popular pairs
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const marketData = await response.json();
        
        const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
        const popularPairs = popularSymbols.map((symbol) => {
          const marketInfo = marketData.find((coin) => coin.symbol === symbol);
          if (marketInfo) {
            return {
              symbol: symbol.replace('USDT', '/USDT'),
              change: parseFloat(marketInfo.priceChangePercent || 0),
            };
          }
          return null;
        }).filter(Boolean);

        setFavoritePairs(popularPairs);
      }
    } catch (error) {
      console.error("Error fetching favorite pairs:", error);
      setFavoritePairs([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <FaArrowDown className="text-green-400" />,
      label: "Quick Buy",
      action: () => navigate("/trade"),
      color: "from-green-500/20 to-emerald-500/10",
      borderColor: "border-green-500/30",
    },
    {
      icon: <FaArrowUp className="text-red-400" />,
      label: "Quick Sell",
      action: () => navigate("/trade"),
      color: "from-red-500/20 to-orange-500/10",
      borderColor: "border-red-500/30",
    },
    {
      icon: <FaExchangeAlt className="text-blue-400" />,
      label: "Trade Now",
      action: () => navigate("/trade"),
      color: "from-blue-500/20 to-cyan-500/10",
      borderColor: "border-blue-500/30",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaFire className="text-orange-400 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Quick Actions</h3>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${action.color} border ${action.borderColor} hover:scale-105 transition-all duration-300`}
          >
            <div className="text-xl">{action.icon}</div>
            <span className="text-xs font-medium text-white">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Favorite Pairs */}
      {!loading && favoritePairs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FaStar className="text-yellow-400 text-sm" />
            <h4 className="text-xs sm:text-sm font-semibold text-gray-400">Favorite Pairs</h4>
          </div>
          <div className="space-y-2">
            {favoritePairs.map((pair, index) => (
              <button
                key={index}
                onClick={() => navigate("/trade")}
                className="w-full flex items-center justify-between p-2 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a] hover:border-teal-500/50 transition-all duration-300"
              >
                <span className="text-xs sm:text-sm font-medium text-white">{pair.symbol}</span>
                <span className={`text-xs font-semibold ${pair.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;

