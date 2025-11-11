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
      icon: <FaArrowDown className="text-teal-400" />,
      label: "Quick Buy",
      action: () => navigate("/trade"),
      color: "bg-gray-700/50",
      borderColor: "border-gray-700",
    },
    {
      icon: <FaArrowUp className="text-gray-400" />,
      label: "Quick Sell",
      action: () => navigate("/trade"),
      color: "bg-gray-700/50",
      borderColor: "border-gray-700",
    },
    {
      icon: <FaExchangeAlt className="text-teal-400" />,
      label: "Trade Now",
      action: () => navigate("/trade"),
      color: "bg-gray-700/50",
      borderColor: "border-gray-700",
    },
  ];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaFire className="text-teal-400 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Quick Actions</h3>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} border ${action.borderColor} hover:border-teal-500/50 hover:scale-105 transition-all duration-300`}
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
            <FaStar className="text-teal-400 text-sm" />
            <h4 className="text-xs sm:text-sm font-semibold text-gray-400">Favorite Pairs</h4>
          </div>
          <div className="space-y-2">
            {favoritePairs.map((pair, index) => (
              <button
                key={index}
                onClick={() => navigate("/trade")}
                className="w-full flex items-center justify-between p-2 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-teal-500/50 transition-all duration-300"
              >
                <span className="text-xs sm:text-sm font-medium text-white">{pair.symbol}</span>
                <span className={`text-xs font-semibold ${pair.change >= 0 ? 'text-teal-400' : 'text-gray-400'}`}>
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

