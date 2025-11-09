import React, { useEffect, useState, useRef } from "react";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import UnifiedRealTimeChart from "../Chart/UnifiedRealTimeChart";
import OrderBook from "../ModernTrading/OrderBook";
import RecentTrades from "../ModernTrading/RecentTrades";
import OrderEntryPanel from "../ModernTrading/OrderEntryPanel";
import WatchlistPanel from "../ModernTrading/WatchlistPanel";
import { ThemeProvider, useTheme } from "../ModernTrading/ThemeProvider";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { FaCoins } from "react-icons/fa";

const DemoContent = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [demoBalance, setDemoBalance] = useState(0);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [orderEntrySide, setOrderEntrySide] = useState('buy');
  const orderEntryPanelRef = useRef(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Your login session expired, You need to log in again",
        confirmButtonColor: "#22c55e",
      }).then(() => {
        navigate("/login");
      });
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

  return (
    <div className={`min-h-screen w-full max-w-[100vw] overflow-x-hidden ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-[#0b0e14] text-gray-200'}`}>
      <div className="flex flex-col h-screen overflow-x-hidden overflow-y-auto w-full max-w-[100vw] lg:h-auto lg:min-h-screen lg:pb-20">
        {/* Demo Balance Header */}
        {profile && (
          <div className="bg-transparent border-b border-[rgba(42,45,58,0.5)] py-4 sm:py-6 px-4 md:px-6 mb-4 sm:mb-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 font-medium flex items-center gap-2">
                  <FaCoins className="text-teal-400 text-xs sm:text-sm" />
                  Demo Balance
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
                    ${demoBalance.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500">Practice trading with virtual funds</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`flex justify-between items-center px-3 sm:px-4 py-3 ${theme === 'light' ? 'bg-gray-50 border-b border-gray-200' : 'bg-[#161a1e] border-b border-[#1a1d29]'} flex-col sm:flex-row gap-3 sm:gap-0`}>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <h1 className={`text-xs sm:text-sm md:text-base lg:text-lg font-medium sm:font-semibold m-0 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
              Demo Trading
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
                balance={demoBalance}
                user={user}
                defaultSide={orderEntrySide}
              />
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
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
