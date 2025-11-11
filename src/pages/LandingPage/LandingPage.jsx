import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaBitcoin, FaChartLine, FaShieldAlt, FaExchangeAlt, FaUsers, FaMobileAlt, FaArrowRight, FaGift, FaGoogle, FaEthereum, FaHeadphones, FaEnvelope, FaWallet, FaChartBar, FaChevronDown, FaSearch, FaFire, FaGlobe } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import Footer from "../../components/Footer/Footer";
import LandingChat from "../../components/LandingChat/LandingChat";

const features = [
  { icon: <FaBitcoin size={32} />, title: "Real-Time Trading", desc: "Execute trades instantly with our high-speed trading engine." },
  { icon: <FaChartLine size={32} />, title: "Advanced Analytics", desc: "Make informed decisions with our AI-powered market insights." },
  { icon: <FaShieldAlt size={32} />, title: "Secure Transactions", desc: "Your funds are protected with top-tier encryption and security." },
  { icon: <FaExchangeAlt size={32} />, title: "Low Transaction Fees", desc: "Enjoy some of the lowest fees in the industry." },
  { icon: <FaUsers size={32} />, title: "Community Support", desc: "Engage with our active trading community for insights and help." },
  { icon: <FaMobileAlt size={32} />, title: "Mobile Trading", desc: "Trade on the go with our fully responsive website in mobile phones." },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hotCoins");
  const [hotCoins, setHotCoins] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [newListings, setNewListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("SOL/USDT");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    buyCrypto: false,
    trade: false,
    tools: false,
    finance: false,
    learn: false,
    more: false,
  });
  const dropdownRefs = {
    buyCrypto: useRef(null),
    trade: useRef(null),
    tools: useRef(null),
    finance: useRef(null),
    learn: useRef(null),
    more: useRef(null),
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.values(dropdownRefs).forEach(ref => {
        if (ref.current && !ref.current.contains(event.target)) {
          const key = Object.keys(dropdownRefs).find(k => dropdownRefs[k] === ref);
          if (key) {
            setDropdowns(prev => ({ ...prev, [key]: false }));
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdownName) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  // Popular trading pairs
  const hotCoinPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ZECUSDT', 'NEARUSDT'];
  
  // Fetch real-time data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch all ticker data
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const allTickers = await response.json();
        
        // Filter USDT pairs
        const usdtPairs = allTickers.filter(ticker => ticker.symbol.endsWith('USDT'));
        
        // Get hot coins data with real sparkline data
        const hotCoinsPromises = hotCoinPairs.map(async (symbol) => {
          const ticker = usdtPairs.find(t => t.symbol === symbol);
          if (!ticker) return null;
          
          try {
            // Fetch klines for sparkline
            const klinesResponse = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`);
            const klines = await klinesResponse.json();
            const sparklineData = klines.map(k => parseFloat(k[4])); // Close prices
            
            return {
              symbol: ticker.symbol,
              name: ticker.symbol.replace('USDT', ''),
              price: parseFloat(ticker.lastPrice),
              change24h: parseFloat(ticker.priceChangePercent),
              sparklineData,
            };
          } catch (error) {
            // Fallback to simple pattern if klines fail
            const changePercent = parseFloat(ticker.priceChangePercent);
            const sparklineData = Array.from({ length: 20 }, (_, i) => {
              const base = changePercent > 0 ? 50 : 30;
              const variation = Math.sin(i * 0.5) * 10;
              return base + variation;
            });
            
            return {
              symbol: ticker.symbol,
              name: ticker.symbol.replace('USDT', ''),
              price: parseFloat(ticker.lastPrice),
              change24h: parseFloat(ticker.priceChangePercent),
              sparklineData,
            };
          }
        });
        
        const hotCoinsData = (await Promise.all(hotCoinsPromises)).filter(Boolean);
        
        // Get top gainers (highest 24h change)
        const sortedByGain = [...usdtPairs]
          .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
          .slice(0, 3)
          .map(ticker => ({
            symbol: ticker.symbol,
            name: ticker.symbol.replace('USDT', ''),
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
          }));
        
        // Get new listings (recently added - using random selection for demo)
        const newListingsData = [...usdtPairs]
          .filter(t => ['STABLEUSDT', 'CCUSDT', 'APEUSDT'].includes(t.symbol) || Math.random() > 0.95)
          .slice(0, 3)
          .map(ticker => ({
            symbol: ticker.symbol,
            name: ticker.symbol.replace('USDT', ''),
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
          }));
        
        setHotCoins(hotCoinsData);
        setTopGainers(sortedByGain);
        setNewListings(newListingsData.length >= 3 ? newListingsData : sortedByGain.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Get crypto icon
  const getCryptoIcon = (name) => {
    const icons = {
      'BTC': <FaBitcoin className="text-yellow-400" />,
      'ETH': <FaEthereum className="text-blue-400" />,
      'SOL': <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">SOL</div>,
      'XRP': <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">XRP</div>,
      'ZEC': <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">ZEC</div>,
      'NEAR': <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold text-white">N</div>,
    };
    return icons[name] || <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold text-white">{name[0]}</div>;
  };

  // Format price
  const formatPrice = (price) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  // Generate sparkline SVG
  const Sparkline = ({ data, isPositive }) => {
    const width = 80;
    const height = 30;
    const padding = 2;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#14b8a6" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200">
      {/* Bybit-Style Navbar */}
      <nav className="w-full flex justify-between items-center px-4 md:px-6 py-3 bg-gray-900 text-white shadow-lg border-b border-gray-800 sticky top-0 z-[1000] backdrop-blur-md">
        {/* Left Section - Logo & Navigation Links */}
        <div className="flex items-center gap-6 md:gap-8">
          <Logo size="default" showText={true} />

          <div className="hidden lg:flex items-center gap-1">
            {/* Buy Crypto Dropdown */}
            <div className="relative" ref={dropdownRefs.buyCrypto}>
              <button
                onClick={() => toggleDropdown('buyCrypto')}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Buy Crypto
                <FaChevronDown className="text-xs" />
              </button>
              {dropdowns.buyCrypto && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <Link to="/deposit" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Deposit
                  </Link>
                  <Link to="/market" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Buy Crypto
                  </Link>
                </div>
              )}
            </div>

            {/* Markets */}
            <Link
              to="/market"
              className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Markets
            </Link>

            {/* Trade Dropdown */}
            <div className="relative" ref={dropdownRefs.trade}>
              <button
                onClick={() => toggleDropdown('trade')}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Trade
                <FaChevronDown className="text-xs" />
              </button>
              {dropdowns.trade && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <Link to="/trade" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Crypto Trading
                  </Link>
                  <Link to="/forex" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Forex Trading
                  </Link>
                  <Link to="/gold" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Gold Trading
                  </Link>
                  <Link to="/demo" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Demo Trading
                  </Link>
                </div>
              )}
            </div>

            {/* Tools Dropdown */}
            <div className="relative" ref={dropdownRefs.tools}>
              <button
                onClick={() => toggleDropdown('tools')}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Tools
                <FaChevronDown className="text-xs" />
              </button>
              {dropdowns.tools && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <Link to="/market" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Market Analysis
                  </Link>
                  <Link to="/trade-history" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Trading Tools
                  </Link>
                </div>
              )}
            </div>

            {/* Finance Dropdown */}
            <div className="relative" ref={dropdownRefs.finance}>
              <button
                onClick={() => toggleDropdown('finance')}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Finance
                <FaChevronDown className="text-xs" />
              </button>
              {dropdowns.finance && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <Link to="/deposit" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Deposit
                  </Link>
                  <Link to="/withdraw" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Withdraw
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Assets
                  </Link>
                </div>
              )}
            </div>

            {/* Learn */}
            <Link
              to="/news"
              className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Learn
            </Link>

            {/* More Dropdown */}
            <div className="relative" ref={dropdownRefs.more}>
              <button
                onClick={() => toggleDropdown('more')}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                More
                <FaChevronDown className="text-xs" />
              </button>
              {dropdowns.more && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <Link to="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Settings
                  </Link>
                  <Link to="/news" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    News
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section - Search Bar */}
        <div className="hidden xl:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FaSearch className="text-gray-400 text-sm" />
            </div>
            <div className="absolute left-10 top-1/2 transform -translate-y-1/2">
              <FaFire className="text-teal-400 text-xs" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => navigate("/market")}
              className="w-full pl-20 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="Search trading pairs..."
            />
          </div>
        </div>

        {/* Right Section - Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log In
            </button>
          </Link>
          <Link to="/register">
            <button className="px-6 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-all duration-300">
              Sign Up
            </button>
          </Link>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <FaGlobe className="text-lg" />
          </button>
        </div>
      </nav>

      {/* Welcome Offer Section */}
      <section className="relative bg-black py-16 md:py-24 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Content */}
          <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            transition={{ duration: 0.8 }}
              className="space-y-6 order-2 lg:order-1"
            >
              {/* Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Experience Real Amazing Profit
              </h2>
              
              {/* Sub-headline */}
              <p className="text-2xl md:text-3xl font-bold text-teal-400">
                Start Your Trading Journey Today!
              </p>

              {/* Offer Details */}
              <div className="flex items-center gap-3">
                <FaGift className="text-amber-500 text-2xl" />
                <p className="text-white text-base md:text-lg">
                  Sign Up to Unlock Amazing Trading Opportunities
                </p>
              </div>

              {/* Input and Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Email/Mobile Number"
                  className="flex-1 px-4 py-4 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-teal-500 transition-colors"
                />
              <Link to="/register">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 flex items-center justify-center gap-2">
                    Sign Up Now <FaArrowRight />
                  </button>
              </Link>
              </div>

              {/* Social Login */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">Or Use</span>
                <div className="flex gap-3">
                  <button className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 border border-gray-700 flex items-center justify-center transition-all duration-300">
                    <FaGoogle className="text-white text-xl" />
                  </button>
                </div>
              </div>

              {/* Demo Trading Link */}
              <Link to="/demo" className="inline-block text-white hover:text-teal-400 transition-colors text-sm md:text-base">
                Try Demo Trading Now <FaArrowRight className="inline ml-1" />
              </Link>
          </motion.div>

            {/* Right Side - 3D Graphic with BTC overlay */}
          <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-96 lg:h-[500px] flex items-center justify-center order-1 lg:order-2"
            >
              {/* Animated Piggy Bank Graphic with Pendulum Effect */}
              <div className="relative w-full h-full">
                {/* Pendulum Container - Swings Left and Right */}
                <motion.div
                  animate={{
                    rotate: [-15, 15, -15],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-6 md:top-8 lg:top-10 left-1/2 transform -translate-x-1/2"
                  style={{
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Vertical Wire - Swings with piggy bank, connects to top cap and piggy */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <motion.div
                      animate={{
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-0.5 h-40 md:h-48 lg:h-56 bg-gradient-to-t from-teal-400 to-teal-500/50"
                    ></motion.div>
                    {/* Top Cap (small horizontal dash) */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gray-400/70 rounded"></div>
                  </div>

                  {/* Main Piggy Bank */}
                  <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mt-40 md:mt-48 lg:mt-56">
                    {/* Piggy Bank Body */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-48 h-56 md:w-60 md:h-72 lg:w-72 lg:h-80">
                        {/* Metallic Gradient Body */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-600 via-teal-500 to-cyan-500 opacity-80 shadow-2xl">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
                        </div>
                        
                        {/* Transparent Bottom with Swirling Pattern */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 lg:h-40 rounded-b-full bg-gradient-to-t from-teal-500/30 via-cyan-500/20 to-transparent overflow-hidden">
                          <div className="absolute inset-0">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(6, 182, 212, 0.2) 50%, transparent 100%)'
                              }}
                            ></motion.div>
                          </div>
                        </div>

                        {/* Coin Slot */}
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>

                    {/* Antennae/Data Streams */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="absolute left-1/2 transform -translate-x-1/2"
                          style={{ left: `${50 + (i - 1) * 20}%` }}
                        >
                          <div className="w-0.5 h-16 bg-gradient-to-t from-teal-400 to-transparent"></div>
                        </motion.div>
                      ))}
                  </div>

                    {/* Floating Coins */}
                    {[
                      { x: 20, y: 30, delay: 0, color: 'from-yellow-400 to-amber-500', size: 'w-12 h-12' },
                      { x: 80, y: 20, delay: 0.5, color: 'from-pink-500 to-teal-500', size: 'w-10 h-10' },
                      { x: 10, y: 70, delay: 1, color: 'from-cyan-400 to-blue-500', size: 'w-8 h-8' },
                      { x: 90, y: 60, delay: 1.5, color: 'from-teal-400 to-green-500', size: 'w-9 h-9' },
                    ].map((coin, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [-10, 10, -10], opacity: [0.6, 1, 0.6], rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, delay: coin.delay, ease: 'easeInOut' }}
                        className={`absolute ${coin.size} rounded-full bg-gradient-to-br ${coin.color} shadow-lg`}
                        style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent"></div>
                      </motion.div>
                    ))}

                    {/* BTC Overlay - Swings with piggy bank */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="relative"
                      >
                        <div className="absolute -inset-6 bg-teal-400/20 blur-2xl rounded-full"></div>
                        <FaBitcoin className="relative text-[6rem] md:text-[7rem] lg:text-[8rem] text-yellow-400 drop-shadow-xl" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trading Opportunity Section */}
      <section className="relative bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Catch Your Next Trading Opportunity
            </h2>
            <Link to="/market">
              <button className="px-6 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold transition-all duration-300 flex items-center gap-2">
                Market Overview <FaArrowRight />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Card - Hot Coins/Derivatives */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("hotCoins")}
                  className={`pb-3 px-2 font-semibold transition-colors ${
                    activeTab === "hotCoins"
                      ? "text-teal-400 border-b-2 border-teal-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Hot Coins
                </button>
                <button
                  onClick={() => setActiveTab("hotDerivatives")}
                  className={`pb-3 px-2 font-semibold transition-colors ${
                    activeTab === "hotDerivatives"
                      ? "text-teal-400 border-b-2 border-teal-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Hot Derivatives
                </button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-16 bg-gray-700/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                        <th className="pb-3">Trading Pairs</th>
                        <th className="pb-3 text-right">Last Traded Price</th>
                        <th className="pb-3 text-right">24H Change</th>
                        <th className="pb-3 text-center">Chart</th>
                        <th className="pb-3 text-center">Trade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotCoins.map((coin, index) => (
                        <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {getCryptoIcon(coin.name)}
                              <span className="text-white font-medium text-sm">{coin.symbol}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-white font-semibold">{formatPrice(coin.price)}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className={`font-semibold ${coin.change24h >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                              {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <Sparkline data={coin.sparklineData} isPositive={coin.change24h >= 0} />
                          </td>
                          <td className="py-4 text-center">
                            <Link to="/trade">
                              <button className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold transition-all duration-300">
                                Trade
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Card - Top Gainers & New Listings */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              {/* Top Gainers */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Top Gainers</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-700/50 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topGainers.map((coin, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-teal-500/50 transition-all duration-300 cursor-pointer"
                        onClick={() => navigate("/trade")}
                      >
                        <div className="flex items-center gap-3">
                          {getCryptoIcon(coin.name)}
                          <div>
                            <div className="text-white font-semibold text-sm">{coin.symbol}</div>
                            <div className="text-gray-400 text-xs">{formatPrice(coin.price)}</div>
                          </div>
                        </div>
                        <span className="text-teal-400 font-semibold text-sm">
                          +{coin.change24h.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700 my-6"></div>

              {/* New Listings */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">New Listings</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-700/50 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newListings.map((coin, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-teal-500/50 transition-all duration-300 cursor-pointer"
                        onClick={() => navigate("/trade")}
                      >
                        <div className="flex items-center gap-3">
                          {getCryptoIcon(coin.name)}
                          <div>
                            <div className="text-white font-semibold text-sm">{coin.symbol}</div>
                            <div className="text-gray-400 text-xs">{formatPrice(coin.price)}</div>
                          </div>
                        </div>
                        <span className={`font-semibold text-sm ${coin.change24h >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                          {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl">
            <Link to="/register" className="w-full md:w-auto">
              <button className="w-full md:w-auto px-8 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <FaArrowRight />
              </button>
            </Link>
            <p className="text-gray-400 text-sm md:text-base text-center md:text-left">
              Sign up now to create your own portfolio for free!
            </p>
          </div>
        </div>

        {/* Floating Support Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            className="w-14 h-14 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-teal-500/50"
            onClick={() => setIsChatOpen(true)}
            aria-label="Support"
          >
            <FaHeadphones className="text-xl" />
          </button>
        </div>

        {/* Landing Chat Component */}
        <LandingChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </section>

      {/* Get Started Section */}
      <section className="relative bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Get Started in 30 Seconds!
            </h2>
          </motion.div>

          {/* Steps Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1: Create Account */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 md:p-8 relative hover:border-teal-500/50 transition-all duration-300"
            >
              {/* Number Badge */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6 mt-4">
                <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <FaEnvelope className="text-teal-400 text-4xl" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">
                Create Account
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base mb-6 text-center leading-relaxed">
                Provide your email address and check your inbox for a 6-digit verification code. Simply enter the code on the verification page to complete your signup.
              </p>

              {/* Button */}
              <Link to="/register" className="block">
                <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40">
                  Sign Up Now
                </button>
              </Link>
            </motion.div>

            {/* Step 2: Make Deposit */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 md:p-8 relative hover:border-teal-500/50 transition-all duration-300"
            >
              {/* Number Badge */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6 mt-4">
                <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <FaWallet className="text-teal-400 text-4xl" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">
                Make Deposit
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base mb-6 text-center leading-relaxed">
                Fund your account easily on the Kraken Web or App.
              </p>

              {/* Button */}
              <Link to="/deposit" className="block">
                <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40">
                  Deposit Now
                </button>
              </Link>
            </motion.div>

            {/* Step 3: Start Trading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 md:p-8 relative hover:border-teal-500/50 transition-all duration-300"
            >
              {/* Number Badge */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6 mt-4">
                <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <FaChartBar className="text-teal-400 text-4xl" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">
                Start Trading
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base mb-6 text-center leading-relaxed">
                Kick off your journey with your favorite Spot pairs or Futures contracts!
              </p>

              {/* Button */}
              <Link to="/trade" className="block">
                <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40">
                  Trade Now
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Why Choose KRAKEN?</h2>
            <p className="text-lg md:text-xl text-gray-400">Everything you need for professional crypto trading</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-teal-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Ready to Start Trading?</h2>
            <p className="text-lg md:text-xl text-gray-400 mb-8">Join thousands of traders and start your crypto journey today</p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40"
              >
                Create Free Account
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
