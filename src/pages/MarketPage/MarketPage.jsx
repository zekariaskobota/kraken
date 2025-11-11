import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import { showToast } from '../../utils/toast';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { FaSearch, FaArrowUp, FaArrowDown, FaStar, FaChartLine, FaFire, FaCoins } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MarketWidget = () => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('volume'); // volume, price, change
  const [filter, setFilter] = useState('all'); // all, gainers, losers
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [trendingCoins, setTrendingCoins] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast.error("Your login session expired. Please log in again");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      const data = response.data
        .filter(coin => coin.symbol.endsWith('USDT'))
        .slice(0, 50)
        .map(coin => ({
          symbol: coin.symbol.replace('USDT', ''),
          price: parseFloat(coin.lastPrice),
          change24h: parseFloat(coin.priceChangePercent),
          volume: parseFloat(coin.quoteVolume),
          high24h: parseFloat(coin.highPrice),
          low24h: parseFloat(coin.lowPrice),
        }))
        .sort((a, b) => b.volume - a.volume);
      
      setMarketData(data);
      
      // Set top gainers (top 5 by positive change)
      const gainers = [...data]
        .filter(coin => coin.change24h > 0)
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 5);
      setTopGainers(gainers);
      
      // Set top losers (top 5 by negative change)
      const losers = [...data]
        .filter(coin => coin.change24h < 0)
        .sort((a, b) => a.change24h - b.change24h)
        .slice(0, 5);
      setTopLosers(losers);
      
      // Set trending coins (top 5 by volume)
      const trending = [...data]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);
      setTrendingCoins(trending);
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredData = marketData
    .filter(coin => coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(coin => {
      if (filter === 'gainers') return coin.change24h > 0;
      if (filter === 'losers') return coin.change24h < 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'volume') return b.volume - a.volume;
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'change') return b.change24h - a.change24h;
      return 0;
    });

  const getCryptoIcon = (symbol) => {
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
      <Navbar/>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold sm:font-bold text-white mb-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
            Market Overview
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400">Real-time cryptocurrency market data and analysis</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                    : 'bg-[rgba(11,14,20,0.6)] text-gray-400 border border-[#2a2d3a] hover:border-teal-500/30'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('gainers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'gainers' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-[rgba(11,14,20,0.6)] text-gray-400 border border-[#2a2d3a] hover:border-green-500/30'
                }`}
              >
                Gainers
              </button>
              <button
                onClick={() => setFilter('losers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'losers' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-[rgba(11,14,20,0.6)] text-gray-400 border border-[#2a2d3a] hover:border-red-500/30'
                }`}
              >
                Losers
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="volume">Sort by Volume</option>
                <option value="price">Sort by Price</option>
                <option value="change">Sort by Change</option>
              </select>
            </div>
          </div>
        </div>

        {/* Market Table */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgba(11,14,20,0.6)] border-b border-[#2a2d3a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Pair</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">24h Change</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">24h High</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">24h Low</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">24h Volume</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2d3a]">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">No results found</td>
                  </tr>
                ) : (
                  filteredData.map((coin, index) => (
                    <tr key={coin.symbol} className="hover:bg-[rgba(38,166,154,0.05)] transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link to={`/crypto/${coin.symbol.toLowerCase()}`} className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                          <img 
                            src={getCryptoIcon(coin.symbol)} 
                            alt={coin.symbol}
                            className="w-6 h-6 rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <span className="font-semibold text-white">{coin.symbol}</span>
                          <span className="text-gray-500">/USDT</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-white">${coin.price.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-semibold px-2 py-1 rounded flex items-center justify-end gap-1 ${
                          coin.change24h >= 0 
                            ? 'text-white bg-green-500' 
                            : 'text-white bg-red-500'
                        }`}>
                          {coin.change24h >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                          {Math.abs(coin.change24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-300">${coin.high24h.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-300">${coin.low24h.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-400">${(coin.volume / 1000000).toFixed(2)}M</td>
                      <td className="px-4 py-3 text-center">
                        <Link 
                          to={`/crypto/${coin.symbol.toLowerCase()}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium hover:bg-teal-500/20 transition-colors"
                        >
                          <FaChartLine /> Trade
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Total Market Cap</div>
            <div className="text-xl font-bold text-white">$2.4T</div>
            <div className="text-xs text-teal-400 mt-1">+2.5% 24h</div>
          </div>
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">24h Volume</div>
            <div className="text-xl font-bold text-white">$89.2B</div>
            <div className="text-xs text-gray-400 mt-1">All Markets</div>
          </div>
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">BTC Dominance</div>
            <div className="text-xl font-bold text-white">52.8%</div>
            <div className="text-xs text-gray-400 mt-1">Market Share</div>
          </div>
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Active Markets</div>
            <div className="text-xl font-bold text-white">{marketData.length}</div>
            <div className="text-xs text-gray-400 mt-1">Trading Pairs</div>
          </div>
        </div>

        {/* Top Gainers & Losers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Top Gainers */}
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <FaArrowUp className="text-green-400 text-sm" />
              <h3 className="text-sm font-semibold text-white">Top Gainers</h3>
            </div>
            <div className="space-y-2">
              {topGainers.slice(0, 5).map((coin, index) => (
                <Link 
                  key={coin.symbol} 
                  to={`/crypto/${coin.symbol.toLowerCase()}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(38,166,154,0.05)] transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                    <img 
                      src={getCryptoIcon(coin.symbol)} 
                      alt={coin.symbol}
                      className="w-5 h-5 rounded-full"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <div className="text-xs font-medium text-white">{coin.symbol}</div>
                      <div className="text-[10px] text-gray-500">${(coin.volume / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white">${coin.price.toFixed(4)}</div>
                    <div className="text-[10px] font-medium text-green-400 flex items-center gap-1">
                      <FaArrowUp className="text-[8px]" />
                      {coin.change24h.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <FaArrowDown className="text-red-400 text-sm" />
              <h3 className="text-sm font-semibold text-white">Top Losers</h3>
            </div>
            <div className="space-y-2">
              {topLosers.slice(0, 5).map((coin, index) => (
                <Link 
                  key={coin.symbol} 
                  to={`/crypto/${coin.symbol.toLowerCase()}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(239,83,80,0.05)] transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                    <img 
                      src={getCryptoIcon(coin.symbol)} 
                      alt={coin.symbol}
                      className="w-5 h-5 rounded-full"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <div className="text-xs font-medium text-white">{coin.symbol}</div>
                      <div className="text-[10px] text-gray-500">${(coin.volume / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white">${coin.price.toFixed(4)}</div>
                    <div className="text-[10px] font-medium text-red-400 flex items-center gap-1">
                      <FaArrowDown className="text-[8px]" />
                      {Math.abs(coin.change24h).toFixed(2)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Coins */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFire className="text-orange-400 text-sm" />
            <h3 className="text-sm font-semibold text-white">Trending Now</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {trendingCoins.map((coin) => (
              <Link 
                key={coin.symbol} 
                to={`/crypto/${coin.symbol.toLowerCase()}`}
                className="bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg p-3 hover:border-teal-500/30 transition-all hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <img 
                    src={getCryptoIcon(coin.symbol)} 
                    alt={coin.symbol}
                    className="w-8 h-8 rounded-full mb-2"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="text-xs font-semibold text-white mb-1">{coin.symbol}</div>
                  <div className="text-[10px] font-medium text-white mb-1">${coin.price.toFixed(4)}</div>
                  <div className={`text-[10px] font-medium flex items-center gap-1 ${
                    coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.change24h >= 0 ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
                    {Math.abs(coin.change24h).toFixed(2)}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <BottomNavigation/>
    </div>
  );
};

export default MarketWidget;
