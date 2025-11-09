import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import TradePopup from '../../components/TradePopup/TradePopup';
import ForexChart from '../../components/Chart/ForexChart';
import OrderBook from '../../components/ModernTrading/OrderBook';
import RecentTrades from '../../components/ModernTrading/RecentTrades';
import { ThemeProvider, useTheme } from '../../components/ModernTrading/ThemeProvider';
import { FaSearch, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ForexTradingContent = () => {
  const [selectedPair, setSelectedPair] = useState("EURUSD");
  const [tradeType, setTradeType] = useState("Buy");
  const [isTradePopupOpen, setTradePopupOpen] = useState(false);
  const [cryptoData, setCryptoData] = useState(null);
  const [topCryptos, setTopCryptos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  
  const forexPairs = [
    { symbol: "EURUSD", name: "EUR to USD", binanceSymbol: "EURUSDT" },
    { symbol: "USDJPY", name: "USD to JPY", binanceSymbol: "USDJPY" },
    { symbol: "GBPUSD", name: "GBP to USD", binanceSymbol: "GBPUSDT" },
    { symbol: "AUDUSD", name: "AUD to USD", binanceSymbol: "AUDUSDT" },
    { symbol: "USDCAD", name: "USD to CAD", binanceSymbol: "USDCAD" },
    { symbol: "USDCHF", name: "USD to CHF", binanceSymbol: "USDCHF" },
    { symbol: "EURGBP", name: "EUR to GBP", binanceSymbol: "EURGBP" },
    { symbol: "EURJPY", name: "EUR to JPY", binanceSymbol: "EURJPY" },
    { symbol: "GBPJPY", name: "GBP to JPY", binanceSymbol: "GBPJPY" },
    { symbol: "CADJPY", name: "CAD to JPY", binanceSymbol: "CADJPY" },
    { symbol: "GBPCAD", name: "GBP to CAD", binanceSymbol: "GBPCAD" },
    { symbol: "EURCAD", name: "EUR to CAD", binanceSymbol: "EURCAD" },
    { symbol: "USDMXN", name: "USD to MXN", binanceSymbol: "USDMXN" },
    { symbol: "USDSEK", name: "USD to SEK", binanceSymbol: "USDSEK" },
    { symbol: "USDZAR", name: "USD to ZAR", binanceSymbol: "USDZAR" },
    { symbol: "EURTRY", name: "EUR to TRY", binanceSymbol: "EURTRY" },
    { symbol: "EURNOK", name: "EUR to NOK", binanceSymbol: "EURNOK" },
    { symbol: "GBPPLN", name: "GBP to PLN", binanceSymbol: "GBPPLN" },
  ];

  const [forexData, setForexData] = useState(
    forexPairs.map((pair, index) => ({
      ...pair,
      rank: index + 1,
      price: 0,
      change: 0,
      volume: 0,
    }))
  );
  const { theme } = useTheme();

  useEffect(() => {
    setTopCryptos(forexPairs);
    if (forexPairs.length > 0) {
      setSelectedPair(forexPairs[0].symbol);
      setCryptoData(forexPairs[0]);
    }
  }, []);

  useEffect(() => {
    // Fetch Forex data
    const fetchForexData = async () => {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const data = response.data;
        
        const forexWithData = forexPairs.map((pair, index) => {
          const marketData = data.find(d => d.symbol === pair.binanceSymbol);
          return {
            ...pair,
            rank: index + 1,
            price: marketData ? parseFloat(marketData.lastPrice) : 0,
            change: marketData ? parseFloat(marketData.priceChangePercent) : 0,
            volume: marketData ? parseFloat(marketData.quoteVolume) : 0,
          };
        });
        
        setForexData(forexWithData);
      } catch (error) {
        // If API fails, just use the pairs without price data
        const forexWithData = forexPairs.map((pair, index) => ({
          ...pair,
          rank: index + 1,
          price: 0,
          change: 0,
          volume: 0,
        }));
        setForexData(forexWithData);
      }
    };

    fetchForexData();
    const interval = setInterval(fetchForexData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDropdownSelect = (pairSymbol) => {
    const selected = forexPairs.find(pair => pair.symbol === pairSymbol);
    setSelectedPair(pairSymbol);
    setCryptoData(selected);
  };

  const filteredPairs = forexData.filter(pair =>
    pair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  const handleTrade = (action) => {
    if (selectedPair) {
      setTradeType(action);
      setTradePopupOpen(true);
    }
  };

  const selectedPairData = forexPairs.find(p => p.symbol === selectedPair);
  const binanceSymbol = selectedPairData?.binanceSymbol || selectedPair;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20 md:pb-20">
      <div className="max-w-[1920px] mx-auto px-0 md:px-4 py-0 md:py-6">
        {/* Header */}
        <div className="mb-4 md:mb-6 px-4 md:px-0 pt-4 md:pt-0">
          <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold sm:font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Forex Trading
          </h1>
        </div>

        {/* Main Trading Layout - Chart first on mobile, Watchlist second, Order Book third */}
        <div className="flex flex-col md:grid md:grid-cols-[250px_1fr_320px] min-h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden w-full md:h-[calc(100vh-60px)] md:overflow-hidden xl:grid-cols-[220px_1fr_300px] gap-0 md:gap-6">
          {/* Center - Chart (First on mobile) */}
          <div className="flex flex-col order-1 md:order-1">
            <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl md:rounded-2xl rounded-none border-b md:border-b-0 p-4 shadow-xl h-[400px] min-h-[400px] max-h-[400px] flex-shrink-0 md:h-[calc(100%-80px)] md:min-h-0 md:max-h-none">
              <ForexChart 
                symbol={selectedPair}
                onPriceUpdate={(price, change, changePercent) => {
                  setCurrentPrice(price);
                  setPriceChange(change);
                  setPriceChangePercent(changePercent);
                }}
              />
            </div>
            {/* Buy/Sell Buttons - Below Chart */}
            <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] border-t-0 rounded-b-2xl md:rounded-b-2xl rounded-none p-3 md:p-4 shadow-xl flex-shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTrade("Buy")}
                  className="px-4 py-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/50 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaArrowUp /> Buy
                </button>
                <button
                  onClick={() => handleTrade("Sell")}
                  className="px-4 py-3 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaArrowDown /> Sell
                </button>
              </div>
            </div>
          </div>

          {/* Left Sidebar - Markets (Second on mobile, First on desktop) */}
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl md:rounded-2xl rounded-none border-b md:border-b-0 p-4 shadow-xl h-[250px] min-h-[250px] max-h-[250px] flex-shrink-0 md:h-full md:min-h-0 md:max-h-none overflow-y-auto order-2 md:order-0">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-3">Markets</h3>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search pairs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div className="space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent">
              {filteredPairs.map((pair) => {
                const isSelected = selectedPair === pair.symbol;
                return (
                  <div
                    key={pair.symbol}
                    onClick={() => handleDropdownSelect(pair.symbol)}
                    className={`p-2 rounded cursor-pointer transition-all h-10 flex items-center ${
                      isSelected
                        ? 'bg-teal-500/20 border-l-2 border-teal-500'
                        : 'bg-[rgba(11,14,20,0.6)] hover:bg-[rgba(11,14,20,0.8)]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs text-gray-400 w-4">{pair.rank}</span>
                        <span className="text-xs font-semibold text-white truncate">{pair.symbol}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {pair.price > 0 ? (
                          <>
                            <span className="text-xs text-gray-300">{formatPrice(pair.price)}</span>
                            <span className={`text-xs font-medium w-12 text-right ${
                              pair.change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-gray-500">-</span>
                            <span className="text-xs text-gray-500 w-12 text-right">-</span>
                          </>
                        )}
                        {isSelected && (
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar - Order Book & Recent Trades (Third on mobile) */}
          <div className="flex flex-col space-y-4 min-h-[300px] md:min-h-0 md:h-full order-3 pb-20 md:pb-0">
            <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-4 shadow-xl">
              <OrderBook symbol={binanceSymbol} />
            </div>
            <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-4 shadow-xl">
              <RecentTrades symbol={binanceSymbol} />
            </div>
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

export function ForexTrading() {
  return (
    <ThemeProvider>
      <ForexTradingContent />
    </ThemeProvider>
  );
}
