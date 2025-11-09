import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "../BottomNavigation/BottomNavigation";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import Swal from 'sweetalert2';
import UnifiedRealTimeChart from "../Chart/UnifiedRealTimeChart";
import OrderEntryPanel from "../ModernTrading/OrderEntryPanel";

const AdvancedChart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cryptoData, setCryptoData] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState('15m');

  const coin = location.state?.cryptoData;

  useEffect(() => {
    if (!coin) {
      Swal.fire({
        icon: 'error',
        title: 'No Data',
        text: 'Crypto data not found. Redirecting to home...',
        confirmButtonColor: '#26a69a',
      }).then(() => {
        navigate('/home');
      });
      return;
    }

    const symbol = coin.symbol || coin.name || 'BTC';
    setSelectedCrypto(symbol);
    fetchUserData();
    fetchCryptoData(symbol);
    const interval = setInterval(() => fetchCryptoData(symbol), 5000);
    return () => clearInterval(interval);
  }, [coin, navigate]);

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

  const fetchCryptoData = async (symbol) => {
    try {
      const symbolUpper = symbol.toUpperCase();
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
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    }
  };

  const handlePriceUpdate = (price, change, changePercent) => {
    setCurrentPrice(price);
    setPriceChange(change);
    setPriceChangePercent(changePercent);
  };

  if (!coin || !cryptoData) {
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

  const symbolForChart = cryptoData?.symbol?.endsWith('USDT') 
    ? cryptoData.symbol 
    : `${cryptoData?.symbol || 'BTC'}USDT`;

  const formatVolume = (volume) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 sm:py-6">
        {/* Header Section - Styled */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Left Side - Crypto Name and Price */}
            <div className="flex flex-col gap-2 sm:gap-3 flex-1 min-w-0 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent truncate">
                  {cryptoData.name}/USDT
                </h1>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words">
                  ${currentPrice.toFixed(cryptoData.current_price >= 1 ? 2 : 8)}
                </span>
                <span className={`text-xs sm:text-sm md:text-base font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
                  priceChange >= 0 
                    ? 'text-teal-400 bg-teal-500/10 border-teal-500/30' 
                    : 'text-red-400 bg-red-500/10 border-red-500/30'
                }`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Right Side - Stats */}
            <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full lg:w-auto lg:flex-shrink-0 overflow-x-auto lg:overflow-visible">
              <div className="flex flex-col gap-1 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-2 sm:p-3 flex-1 sm:flex-initial min-w-[80px] sm:min-w-[100px] flex-shrink-0">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-medium">24h High</span>
                <span className="text-sm sm:text-base md:text-lg font-bold text-teal-400 break-words">
                  ${cryptoData.high.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col gap-1 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-2 sm:p-3 flex-1 sm:flex-initial min-w-[80px] sm:min-w-[100px] flex-shrink-0">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-medium">24h Low</span>
                <span className="text-sm sm:text-base md:text-lg font-bold text-red-400 break-words">
                  ${cryptoData.low.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col gap-1 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-2 sm:p-3 flex-1 sm:flex-initial min-w-[80px] sm:min-w-[100px] flex-shrink-0">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-medium">24h Volume</span>
                <span className="text-sm sm:text-base md:text-lg font-bold text-white break-words">
                  {formatVolume(cryptoData.volume)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-6 bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-2 sm:p-4 shadow-xl backdrop-blur-sm overflow-hidden">
          <UnifiedRealTimeChart
            symbol={symbolForChart}
            type="crypto"
            onPriceUpdate={handlePriceUpdate}
          />
        </div>

        {/* Order Entry Section */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
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

export default AdvancedChart;
