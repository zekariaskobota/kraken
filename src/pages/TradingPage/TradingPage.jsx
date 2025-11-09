import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import UnifiedRealTimeChart from "../../components/Chart/UnifiedRealTimeChart";
import OrderBook from "../../components/ModernTrading/OrderBook";
import RecentTrades from "../../components/ModernTrading/RecentTrades";
import OrderEntryPanel from "../../components/ModernTrading/OrderEntryPanel";
import WatchlistPanel from "../../components/ModernTrading/WatchlistPanel";
import { ThemeProvider, useTheme } from "../../components/ModernTrading/ThemeProvider";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

const TradingPageContent = () => {
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
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'Your login session expired. Please log in again.',
        confirmButtonColor: '#22c55e',
      }).then(() => {
        navigate('/login');
      });
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
                balance={balance}
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

const TradingPage = () => {
  return (
    <ThemeProvider>
      <TradingPageContent />
    </ThemeProvider>
  );
};

export default TradingPage;
