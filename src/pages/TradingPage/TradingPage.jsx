import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from '../../utils/toast';
import UnifiedRealTimeChart from "../../components/Chart/UnifiedRealTimeChart";
import OrderBook from "../../components/ModernTrading/OrderBook";
import RecentTrades from "../../components/ModernTrading/RecentTrades";
import OrderEntryPanel from "../../components/ModernTrading/OrderEntryPanel";
import WatchlistPanel from "../../components/ModernTrading/WatchlistPanel";
import TradePopup from "../../components/TradePopup/TradePopup";
import { ThemeProvider, useTheme } from "../../components/ModernTrading/ThemeProvider";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const TradingPageContent = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [orderEntrySide, setOrderEntrySide] = useState('buy');
  const [isTradePopupOpen, setTradePopupOpen] = useState(false);
  const [tradeType, setTradeType] = useState("Buy");
  const [cryptoData, setCryptoData] = useState(null);
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

  useEffect(() => {
    // Set crypto data for trade popup
    const symbol = selectedSymbol.replace('USDT', '');
    setCryptoData({
      symbol: symbol,
      name: symbol,
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
      <div className="flex flex-col h-screen overflow-x-hidden overflow-y-auto w-full max-w-[100vw]">
        {/* Asset Selection Header */}
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
                balance={balance}
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
      <TradePopup
        cryptoData={cryptoData}
        isOpen={isTradePopupOpen}
        onClose={() => setTradePopupOpen(false)}
        tradeType={tradeType}
      />
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
