import React, { useEffect, useState, useRef } from "react";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import UnifiedRealTimeChart from "../Chart/UnifiedRealTimeChart";
import OrderBook from "../ModernTrading/OrderBook";
import RecentTrades from "../ModernTrading/RecentTrades";
import OrderEntryPanel from "../ModernTrading/OrderEntryPanel";
import WatchlistPanel from "../ModernTrading/WatchlistPanel";
import DemoPopup from "../DemoPopup/DemoPopup";
import { ThemeProvider, useTheme } from "../ModernTrading/ThemeProvider";
import showToast from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { FaCoins, FaArrowUp, FaArrowDown, FaChartBar, FaTrophy } from "react-icons/fa";

const DemoContent = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [demoBalance, setDemoBalance] = useState(0);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [orderEntrySide, setOrderEntrySide] = useState('buy');
  const [isTradePopupOpen, setTradePopupOpen] = useState(false);
  const [tradeType, setTradeType] = useState("Buy");
  const [cryptoData, setCryptoData] = useState(null);
  const orderEntryPanelRef = useRef(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast.error("Session expired. Please log in again");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    // Fetch user profile and demo balance
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setUser(data);
          setDemoBalance(data.demoBalance || 0);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    setCryptoData({
      symbol: selectedSymbol,
      name: selectedSymbol.replace('USDT', ''),
      current_price: currentPrice,
      price_change_percentage_24h: priceChangePercent,
    });
  }, [selectedSymbol, currentPrice, priceChangePercent]);

  const handleTrade = (action) => {
    setTradeType(action);
    setTradePopupOpen(true);
  };

  return (
    <div className={`min-h-screen w-full max-w-[100vw] overflow-x-hidden ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-[#0b0e14] text-gray-200'}`}>
      <div className="flex flex-col h-screen overflow-x-hidden overflow-y-auto w-full max-w-[100vw] lg:h-auto lg:min-h-screen lg:pb-20">
        {/* Demo Balance Header with Right Side Info */}
        {profile && (
          <div className="bg-transparent border-b border-[rgba(42,45,58,0.5)] py-4 sm:py-6 px-0 mb-4 sm:mb-6">
            <div className="px-4 md:px-6 flex justify-between items-center gap-4 sm:gap-6">
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 font-medium flex items-center gap-2">
                  <FaCoins className="text-teal-400 text-xs sm:text-sm" />
                  Demo Balance
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
                    <span className="text-sm opacity-60">USD</span> {demoBalance.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500">Practice trading with virtual funds</p>
              </div>
              
              {/* Right Side Info */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col items-end gap-1 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-purple-400 text-sm" />
                    <span className="text-xs text-gray-400">Trading Mode</span>
                  </div>
                  <span className="text-sm font-bold text-purple-400">Practice</span>
                </div>
                <div className="flex flex-col items-end gap-1 px-4 py-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaTrophy className="text-teal-400 text-sm" />
                    <span className="text-xs text-gray-400">Total Trades</span>
                  </div>
                  <span className="text-sm font-bold text-teal-400">0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`flex justify-between items-center px-3 sm:px-4 py-3 ${theme === 'light' ? 'bg-gray-50 border-b border-gray-200' : 'bg-[#161a1e] border-b border-[#1a1d29]'} flex-col sm:flex-row gap-3 sm:gap-0`}>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex flex-col">
              <h1 className={`text-sm sm:text-base md:text-lg lg:text-xl font-semibold m-0 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                {selectedSymbol.replace('USDT', '/USDT')}
              </h1>
              <span className={`text-xs ${priceChangePercent >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}% 24h
              </span>
            </div>
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
        </div>

        {/* Main Trading Layout - Watchlist Left, Chart Center, Order Book Right */}
        <div className="flex flex-col md:grid md:grid-cols-[250px_1fr_320px] min-h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden w-full md:h-[calc(100vh-60px)] md:overflow-hidden xl:grid-cols-[220px_1fr_300px]">
          {/* Center - Chart (Main Focus - Wide) - First on mobile */}
          <div className={`flex flex-col order-1 md:order-1 ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0b0e14] border-[#1a1d29]'
          }`}>
            <div className={`h-[550px] min-h-[550px] max-h-[550px] flex-shrink-0 overflow-hidden relative border-r md:border-r md:border-b-0 border-b md:h-[calc(100vh-120px)] md:min-h-[500px] md:max-h-[calc(100vh-120px)] ${
              theme === 'light' ? 'border-gray-200' : 'border-[#1a1d29]'
            }`}>
              <UnifiedRealTimeChart
                symbol={selectedSymbol}
                type="crypto"
                onPriceUpdate={(price, change, changePercent) => {
                  setCurrentPrice(price);
                  setPriceChange(change);
                  setPriceChangePercent(changePercent);
                }}
              />
            </div>
            {/* Buy/Sell Buttons - Below Chart - Bybit Style */}
            <div className={`flex-shrink-0 border-r md:border-r border-t px-3 py-2 md:px-4 md:py-3 ${
              theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0b0e14] border-[#1a1d29]'
            }`}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTrade("Buy")}
                  className="w-full py-2.5 md:py-3 bg-[#0ECB81] hover:bg-[#0eb372] text-white rounded-full font-semibold transition-all duration-200 text-sm md:text-base"
                >
                  Buy
                </button>
                <button
                  onClick={() => handleTrade("Sell")}
                  className="w-full py-2.5 md:py-3 bg-[#F6465D] hover:bg-[#e63d54] text-white rounded-full font-semibold transition-all duration-200 text-sm md:text-base"
                >
                  Sell
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Order Book, Recent Trades, Order Entry - Second on mobile, Third on desktop */}
          <div className={`flex flex-col min-h-[600px] md:h-auto md:min-h-0 flex-1 border-l md:border-l md:border-t-0 border-t overflow-hidden order-2 md:order-2 pb-20 md:pb-0 ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-[#161a1e] border-[#1a1d29]'
          }`}>
            <div className="flex flex-col min-h-[300px] md:h-1/2 md:min-h-0 overflow-y-auto">
              <OrderBook symbol={selectedSymbol} />
              <RecentTrades symbol={selectedSymbol} />
            </div>
            <div className="min-h-[300px] md:h-1/2 md:min-h-0 overflow-y-auto border-t" ref={orderEntryPanelRef}>
              <OrderEntryPanel
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                balance={demoBalance}
                user={user}
                defaultSide={orderEntrySide}
              />
            </div>
          </div>

          {/* Left - Markets (Watchlist) - Hidden on mobile, First on desktop */}
          <div className={`hidden md:block md:h-auto md:min-h-0 md:max-h-none flex-shrink-0 border-r overflow-y-auto md:order-0 ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-[#161a1e] border-[#1a1d29]'
          }`}>
            <WatchlistPanel
              selectedSymbol={selectedSymbol}
              onSymbolSelect={setSelectedSymbol}
            />
          </div>
        </div>
      </div>
      <BottomNavigation />
      <DemoPopup
        cryptoData={cryptoData}
        isOpen={isTradePopupOpen}
        onClose={() => setTradePopupOpen(false)}
        tradeType={tradeType}
      />
    </div>
  );
};

const Demo = () => {
  return (
    <ThemeProvider>
      <DemoContent />
    </ThemeProvider>
  );
};

export default Demo;
