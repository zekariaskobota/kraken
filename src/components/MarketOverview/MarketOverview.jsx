import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaStar, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MarketOverview = () => {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      // Fetch real market data from Binance API
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      const data = await response.json();

      // Filter USDT pairs and format data
      const usdtPairs = data
        .filter((coin) => coin.symbol.endsWith('USDT'))
        .map((coin) => ({
          symbol: coin.symbol.replace('USDT', '/USDT'),
          price: parseFloat(coin.lastPrice),
          change: parseFloat(coin.priceChange),
          changePercent: parseFloat(coin.priceChangePercent),
        }))
        .filter((coin) => coin.price > 0 && !isNaN(coin.changePercent));

      // Sort by change percent and get top gainers/losers
      const sortedByGain = [...usdtPairs].sort((a, b) => b.changePercent - a.changePercent);
      const sortedByLoss = [...usdtPairs].sort((a, b) => a.changePercent - b.changePercent);

      setTopGainers(sortedByGain.slice(0, 3));
      setTopLosers(sortedByLoss.slice(0, 3));
      setWatchlist(sortedByGain.slice(0, 2));
    } catch (error) {
      console.error("Error fetching market data:", error);
      // Fallback to empty arrays on error
      setTopGainers([]);
      setTopLosers([]);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const MarketList = ({ title, items, isGainer }) => (
    <div className="mb-4">
      <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-teal-500/50 transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/trade")}
          >
            <div className="flex-1">
              <div className="text-xs sm:text-sm font-medium text-white">{item.symbol}</div>
              <div className="text-xs text-gray-500">${item.price.toLocaleString()}</div>
            </div>
            <div className={`text-xs sm:text-sm font-semibold flex items-center gap-1 ${isGainer ? "text-teal-400" : "text-gray-400"}`}>
              {isGainer ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
              {Math.abs(item.changePercent).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaGlobe className="text-teal-400 text-lg" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Market Overview</h3>
        </div>
        <button
          onClick={() => navigate("/market")}
          className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          View All
        </button>
      </div>

      <MarketList title="Top Gainers" items={topGainers} isGainer={true} />
      <MarketList title="Top Losers" items={topLosers} isGainer={false} />

      {watchlist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaStar className="text-teal-400 text-sm" />
            <h4 className="text-xs sm:text-sm font-semibold text-gray-400">Watchlist</h4>
          </div>
          <div className="space-y-2">
            {watchlist.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-teal-500/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate("/trade")}
              >
                <div className="text-xs sm:text-sm font-medium text-white">{item.symbol}</div>
                <div className="text-xs text-teal-400 font-semibold">+{item.changePercent.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketOverview;

