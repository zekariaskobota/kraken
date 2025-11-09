import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import BottomNavigation from "../BottomNavigation/BottomNavigation";
import UnifiedRealTimeChart from "../Chart/UnifiedRealTimeChart";
import OrderEntryPanel from "../ModernTrading/OrderEntryPanel";
import axios from "axios";
import Swal from 'sweetalert2';

const BuySellChart = () => {
  const location = useLocation();
  const { cryptoId } = useParams();
  const navigate = useNavigate();
  const [cryptoData, setCryptoData] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get symbol from URL params or location state
  const symbolFromUrl = cryptoId ? cryptoId.toUpperCase() : null;
  const { symbol: symbolFromState } = location.state?.cryptoData || {};
  const symbol = symbolFromUrl || symbolFromState || "BTC";
  const coin = location.state?.cryptoData || null;

  useEffect(() => {
    // Update selectedCrypto when URL param or location state changes
    const newSymbol = cryptoId ? cryptoId.toUpperCase() : (location.state?.cryptoData?.symbol || "BTC");
    if (newSymbol && newSymbol !== selectedCrypto) {
      setSelectedCrypto(newSymbol);
    }
  }, [cryptoId, location.state]);

  useEffect(() => {
    fetchUserData();
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 5000);
    return () => clearInterval(interval);
  }, [selectedCrypto]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const symbolUpper = selectedCrypto.toUpperCase();
      const symbolForApi = symbolUpper.endsWith('USDT') ? symbolUpper : `${symbolUpper}USDT`;

      const marketResponse = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbolForApi}`
      );

      if (!marketResponse.data) {
        throw new Error("Invalid crypto ID or data unavailable");
      }

      const data = marketResponse.data;
      const price = parseFloat(data.lastPrice);
      const change = parseFloat(data.priceChange);
      const changePercent = parseFloat(data.priceChangePercent);

      setCryptoData({
        name: symbolUpper,
        symbol: symbolUpper,
        current_price: price,
        price_change_percentage_24h: changePercent,
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
        quoteVolume: parseFloat(data.quoteVolume),
      });

      setCurrentPrice(price);
      setPriceChange(change);
      setPriceChangePercent(changePercent);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  const handlePriceUpdate = (price, change, changePercent) => {
    setCurrentPrice(price);
    setPriceChange(change);
    setPriceChangePercent(changePercent);
  };

  if (loading && !cryptoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-teal-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading chart data...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!cryptoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-red-400">Failed to load crypto data</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const symbolForChart = cryptoData?.symbol?.endsWith('USDT') 
    ? cryptoData.symbol 
    : `${cryptoData?.symbol || 'BTC'}USDT`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header Section */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
              {cryptoData.name}/USDT
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                ${currentPrice.toFixed(cryptoData.current_price >= 1 ? 2 : 8)}
              </span>
              <span className={`text-xs sm:text-sm md:text-base lg:text-lg font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg ${
                priceChange >= 0 
                  ? 'text-teal-400 bg-teal-500/10' 
                  : 'text-red-400 bg-red-500/10'
              }`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="flex flex-col gap-1 text-right sm:text-right">
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">24h High</span>
              <span className="text-sm sm:text-base font-semibold text-teal-400">
                ${cryptoData.high.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-right sm:text-right">
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">24h Low</span>
              <span className="text-sm sm:text-base font-semibold text-red-400">
                ${cryptoData.low.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-right sm:text-right">
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">24h Volume</span>
              <span className="text-sm sm:text-base font-semibold text-white">
                {cryptoData.volume >= 1000000 
                  ? `${(cryptoData.volume / 1000000).toFixed(2)}M` 
                  : cryptoData.volume >= 1000 
                  ? `${(cryptoData.volume / 1000).toFixed(2)}K` 
                  : cryptoData.volume.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-6">
          <UnifiedRealTimeChart
            symbol={symbolForChart}
            type="crypto"
            onPriceUpdate={handlePriceUpdate}
          />
        </div>

        {/* Order Entry Section */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6">
          <OrderEntryPanel
            symbol={symbolForChart}
            currentPrice={currentPrice}
            balance={balance}
            user={user}
          />
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BuySellChart;
