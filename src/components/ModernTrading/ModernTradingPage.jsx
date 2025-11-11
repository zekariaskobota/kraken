import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toast';
import ModernTradingChart from './ModernTradingChart';
import OrderBook from './OrderBook';
import RecentTrades from './RecentTrades';
import OrderEntryPanel from './OrderEntryPanel';
import WatchlistPanel from './WatchlistPanel';
import { ThemeProvider, useTheme } from './ThemeProvider';

const ModernTradingPageContent = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [orderEntrySide, setOrderEntrySide] = useState('buy');
  const orderEntryPanelRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast.error("Your login session expired. Please log in again");
      navigate('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
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

    fetchUserData();
  }, [navigate]);

  return (
    <div className={`min-h-screen w-full max-w-[100vw] overflow-x-hidden ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-[#0b0e14] text-gray-200'}`}>
      <div className="flex flex-col h-screen overflow-x-hidden overflow-y-auto w-full max-w-[100vw]">
        {/* Header */}
        <div className={`flex justify-between items-center px-3 sm:px-4 py-3 ${theme === 'light' ? 'bg-gray-50 border-b border-gray-200' : 'bg-[#161a1e] border-b border-[#1a1d29]'} flex-col sm:flex-row gap-3 sm:gap-0`}>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <h1 className={`text-xs sm:text-sm md:text-base lg:text-lg font-medium sm:font-semibold m-0 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
              Spot Trading
            </h1>
            <div className="relative">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-[10px] sm:text-xs md:text-sm cursor-pointer outline-none transition-all ${
                  theme === 'light' 
                    ? 'bg-white border border-gray-200 text-gray-800' 
                    : 'bg-[#1a1d29] border border-[#2a2d3a] text-gray-200'
                }`}
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="ADAUSDT">ADA/USDT</option>
                <option value="XRPUSDT">XRP/USDT</option>
                <option value="DOGEUSDT">DOGE/USDT</option>
                <option value="DOTUSDT">DOT/USDT</option>
                <option value="MATICUSDT">MATIC/USDT</option>
                <option value="LTCUSDT">LTC/USDT</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex flex-col items-end sm:items-end">
              <span className={`text-sm sm:text-base md:text-lg lg:text-xl font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                ${currentPrice.toFixed(2)}
              </span>
              <span className={`text-[10px] sm:text-xs font-medium ${
                priceChange >= 0 ? 'text-teal-400' : 'text-red-400'
              }`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
            <button 
              onClick={toggleTheme} 
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-sm sm:text-base cursor-pointer transition-all ${
                theme === 'light' 
                  ? 'bg-white border border-gray-200 text-gray-800' 
                  : 'bg-[#1a1d29] border border-[#2a2d3a] text-gray-200'
              }`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Main Trading Layout - Watchlist Left, Chart Center, Order Book Right */}
        <div className="flex flex-col md:grid md:grid-cols-[250px_1fr_320px] min-h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden w-full md:h-[calc(100vh-60px)] md:overflow-hidden xl:grid-cols-[220px_1fr_300px]">
          {/* Center - Chart (Main Focus - Wide) - First on mobile */}
          <div className={`flex flex-col order-1 md:order-1 ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0b0e14] border-[#1a1d29]'
          }`}>
            <div className={`h-[400px] min-h-[400px] max-h-[400px] flex-shrink-0 overflow-visible relative border-r md:border-r md:border-b-0 border-b md:h-[calc(100%-80px)] md:min-h-0 md:max-h-none ${
              theme === 'light' ? 'border-gray-200' : 'border-[#1a1d29]'
            }`}>
              <ModernTradingChart
                symbol={selectedSymbol}
                onPriceUpdate={(price, change, changePercent) => {
                  setCurrentPrice(price);
                  setPriceChange(change);
                  setPriceChangePercent(changePercent);
                }}
              />
            </div>
            {/* Buy/Sell Buttons - Below Chart */}
            <div className={`flex-shrink-0 border-r md:border-r border-t p-3 md:p-4 ${
              theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0b0e14] border-[#1a1d29]'
            }`}>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setOrderEntrySide('buy');
                    if (orderEntryPanelRef.current) {
                      orderEntryPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  className="px-4 py-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/50 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">↑</span> Buy
                </button>
                <button
                  onClick={() => {
                    setOrderEntrySide('sell');
                    if (orderEntryPanelRef.current) {
                      orderEntryPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  className="px-4 py-3 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">↓</span> Sell
                </button>
              </div>
            </div>
          </div>

          {/* Left - Markets (Watchlist) - Second on mobile, First on desktop */}
          <div className={`overflow-y-auto border-r md:border-r md:border-b-0 border-b h-[250px] min-h-[250px] max-h-[250px] flex-shrink-0 md:h-full md:min-h-0 md:max-h-none order-2 md:order-0 ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-[#161a1e] border-[#1a1d29]'
          }`}>
            <WatchlistPanel
              selectedSymbol={selectedSymbol}
              onSymbolSelect={setSelectedSymbol}
            />
          </div>

          {/* Right Sidebar - Order Book, Recent Trades, Order Entry - Third on mobile */}
          <div className={`flex flex-col overflow-hidden border-l md:border-l md:border-t-0 border-t flex-1 min-h-[350px] md:h-full md:min-h-0 order-3 pb-20 md:pb-0 ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-[#161a1e] border-[#1a1d29]'
          }`}>
            <div className="flex flex-col h-1/2 overflow-hidden">
              <OrderBook symbol={selectedSymbol} />
              <RecentTrades symbol={selectedSymbol} />
            </div>
            <div className="h-1/2 overflow-y-auto border-t" ref={orderEntryPanelRef}>
              <OrderEntryPanel
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                balance={balance}
                user={user}
                defaultSide={orderEntrySide}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModernTradingPage = () => {
  return (
    <ThemeProvider>
      <ModernTradingPageContent />
    </ThemeProvider>
  );
};

export default ModernTradingPage;

