import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaArrowDown, FaExchangeAlt, FaArrowUp, FaWallet, FaChartLine, FaSignOutAlt, FaGlobe, FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import Carousel from "../../components/Carousel/Carousel";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import Footer from "../../components/Footer/Footer";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import ModernWatchlist from "../../components/Watchlist/ModernWatchlist";

const cryptoIconMap = {
  btc: "bitcoin.png",
  eth: "ethereum.png",
  bnb: "bnb.png",
  bcc: "bitconnect.png",
  ltc: "LTC.png",
  xrp: "xrp.png",
  ada: "cardano.png",
  sol: "sol.png",
  doge: "dogecoin.png",
  dot: "polkadot.png",
  matic: "polygon.png",
  shib: "shiba.png",
  avax: "avalanche.png",
  trx: "trx.png",
  xlm: "stellar.png",
  link: "link.png",
  neo: "neo.png",
  eos: "eos.png",
  tusd: "tusd.png",
  iota: "iota.png",
  qtum: "qtum.png",
  icx: "icx.png",
  ven: "https://cryptologos.cc/logos/vechain-vet-logo.png",
  nuls: "https://cryptologos.cc/logos/nuls-nuls-logo.png",
  vet: "vechain.png",
  ont:"ont.png"
};

const defaultIconUrl = "https://via.placeholder.com/32"; // Placeholder image URL

const Home = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [currencyRates, setCurrencyRates] = useState({});
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const currencyDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCryptoData();
    fetchUserData();
    fetchCurrencyRates();
    const interval = setInterval(fetchCryptoData, 5000); // Fetch data every 5 seconds
    const userInterval = setInterval(fetchUserData, 10000); // Fetch user data every 10 seconds
    const ratesInterval = setInterval(fetchCurrencyRates, 30000); // Fetch rates every 30 seconds
    
    return () => {
      clearInterval(interval);
      clearInterval(userInterval);
      clearInterval(ratesInterval);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    };

    if (isCurrencyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCurrencyDropdownOpen]);

  const fetchCurrencyRates = async () => {
    try {
      const response = await axios.get("https://api.binance.com/api/v3/ticker/price");
      const rates = {};
      response.data.forEach((item) => {
        if (item.symbol.endsWith("USDT")) {
          const currency = item.symbol.replace("USDT", "");
          rates[currency] = parseFloat(item.price);
        }
      });
      rates["USDT"] = 1; // USDT to USDT is 1:1
      setCurrencyRates(rates);
    } catch (error) {
      console.error("Error fetching currency rates:", error);
    }
  };

  const convertBalance = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    if (toCurrency === "USDT") return amount;
    
    const rate = currencyRates[toCurrency];
    if (!rate) return amount;
    
    // Convert from USDT to selected currency
    return amount / rate;
  };

  const getConvertedBalance = () => {
    if (selectedCurrency === "USDT") {
      return balance;
    }
    return convertBalance(balance, "USDT", selectedCurrency);
  };

  const currencies = [
    { code: "USDT", name: "Tether" },
    { code: "BTC", name: "Bitcoin" },
    { code: "ETH", name: "Ethereum" },
    { code: "BNB", name: "Binance Coin" },
    { code: "SOL", name: "Solana" },
    { code: "XRP", name: "Ripple" },
    { code: "ADA", name: "Cardano" },
    { code: "DOGE", name: "Dogecoin" },
  ];

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserLoading(false);
        return;
      }

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
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Session Expired',
      text: 'Your login session expired, You need to log in again',
      confirmButtonColor: '#22c55e', // Tailwind green-500
    }).then(() => {
      navigate("/login"); // Redirect to login after closing the alert
    });
  }
}, [navigate]);

  const fetchCryptoData = async () => {
    try {
      const marketUrl = "https://api.binance.com/api/v3/ticker/24hr";
      const { data } = await axios.get(marketUrl);

      const topCryptos = data
        .filter((coin) => coin.symbol.endsWith("USDT"))
        .slice(0, 15)
        .map((coin) => ({
          id: coin.symbol.replace("USDT", "").toLowerCase(),
          name: coin.symbol.replace("USDT", ""),
          symbol: coin.symbol.replace("USDT", ""),
          lowPrice: parseFloat(coin.lowPrice),
          highPrice: parseFloat(coin.highPrice),
          current_price: parseFloat(coin.lastPrice),
          price_change_percentage_24h: parseFloat(coin.priceChangePercent),
        }));

      // Fetch candlestick (OHLC) data
      const promises = topCryptos.map(async (coin) => {
        try {
          const chartUrl = `https://api.binance.com/api/v3/klines?symbol=${coin.symbol}USDT&interval=5m&limit=40`;
          const { data: chartData } = await axios.get(chartUrl);
          return {
            ...coin,
            sparkline: chartData.map(([timestamp, open, high, low, close]) => ({
              time: new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              price: parseFloat(close),
            })),
          };
        } catch (error) {
          console.error(`Error fetching chart for ${coin.symbol}:`, error);
          return { ...coin, sparkline: [] };
        }
      });

      const cryptoWithChart = await Promise.all(promises);
      
      setCryptoData(cryptoWithChart);
      
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
    setLoading(false); // Hide the spinner after data fetch
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
      <Navbar />
      
      {/* Balance Header Section */}
      <div className="bg-transparent border-b border-[rgba(42,45,58,0.5)] py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-6 flex-wrap">
          <div className="flex flex-col gap-2">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium">Available Balance</div>
            <div className="flex items-baseline gap-0">
              {userLoading ? (
                <div className="flex items-baseline gap-0">
                  <div className="relative h-8 md:h-10 w-32 md:w-40 bg-slate-700/30 rounded-lg overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"
                      style={{
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s ease-in-out infinite'
                      }}
                    ></div>
                  </div>
                  <div className="relative h-5 w-12 bg-slate-700/30 rounded ml-1 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"
                      style={{
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s ease-in-out infinite'
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
                      {isBalanceVisible 
                        ? getConvertedBalance().toFixed(selectedCurrency === "BTC" ? 8 : selectedCurrency === "ETH" ? 6 : 2)
                        : "****"
                      }
                    </span>
                    <button
                      onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                      className="text-gray-400 hover:text-teal-400 transition-colors duration-200 p-1"
                      aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
                    >
                      {isBalanceVisible ? (
                        <FaEye className="text-sm md:text-base" />
                      ) : (
                        <FaEyeSlash className="text-sm md:text-base" />
                      )}
                    </button>
                  </div>
                  {/* Currency Dropdown */}
                  <div className="relative" ref={currencyDropdownRef}>
                    <button
                      onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                      className="flex items-center gap-0.5 px-1 py-0 rounded-lg text-xs md:text-sm text-gray-400 font-medium hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-200"
                    >
                      <span>{selectedCurrency}</span>
                      <FaChevronDown className={`text-[10px] transition-transform duration-200 ${isCurrencyDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isCurrencyDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-40 bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border border-[rgba(42,45,58,0.8)] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl max-h-60 overflow-y-auto">
                        <div className="py-1">
                          {currencies.map((currency) => (
                            <button
                              key={currency.code}
                              onClick={() => {
                                setSelectedCurrency(currency.code);
                                setIsCurrencyDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-all duration-200 ${
                                selectedCurrency === currency.code
                                  ? "bg-teal-500/20 text-teal-400"
                                  : "text-gray-300 hover:bg-teal-500/10 hover:text-teal-400"
                              }`}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-xs">{currency.code}</span>
                                <span className="text-[10px] text-gray-500">{currency.name}</span>
                              </div>
                              {selectedCurrency === currency.code && (
                                <span className="text-teal-400 text-xs">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {user && (
              <div className="text-sm text-gray-400 mt-1">
                Welcome back, <span className="text-teal-400 font-semibold">{user.name || user.email || 'Trader'}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 flex-shrink-0">
            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg text-sm font-medium text-teal-400 border border-teal-500/30 bg-[rgba(26,29,41,0.6)] transition-all duration-300 hover:bg-teal-500/10 hover:border-teal-500/50 hover:-translate-y-0.5"
            >
              <FaArrowDown className="text-sm" />
              <span>Deposit</span>
            </Link>
          </div>
        </div>
      </div>

      <Carousel />

      <div className="max-w-full w-full mx-auto px-4 md:px-6 box-border">
        {/* Trading Features Section */}
        <div className="mb-6 mt-6">
          <div className="grid grid-cols-4 gap-1">
            <Link 
              to="/trade" 
              className="flex flex-col items-center gap-1 text-center transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-400 transition-all duration-300 group-hover:bg-teal-500/25 group-hover:scale-105">
                <FaArrowDown className="text-lg" />
              </div>
              <h3 className="text-[10px] font-normal text-gray-400">Deposit</h3>
            </Link>
            <Link 
              to="/trade" 
              className="flex flex-col items-center gap-1 text-center transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-400 transition-all duration-300 group-hover:bg-teal-500/25 group-hover:scale-105">
                <FaExchangeAlt className="text-lg" />
              </div>
              <h3 className="text-[10px] font-normal text-gray-400">Trade</h3>
            </Link>
            <Link 
              to="/profile" 
              className="flex flex-col items-center gap-1 text-center transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-400 transition-all duration-300 group-hover:bg-teal-500/25 group-hover:scale-105">
                <FaArrowUp className="text-lg" />
              </div>
              <h3 className="text-[10px] font-normal text-gray-400">Withdraw</h3>
            </Link>
            <Link 
              to="/market" 
              className="flex flex-col items-center gap-1 text-center transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-400 transition-all duration-300 group-hover:bg-teal-500/25 group-hover:scale-105">
                <FaGlobe className="text-lg" />
              </div>
              <h3 className="text-[10px] font-normal text-gray-400">Markets</h3>
            </Link>
          </div>
        </div>

        <div className="text-center mb-8 pt-5">
          <h2 className="text-base sm:text-lg md:text-xl font-medium text-white mb-2">Market Overview</h2>
          <p className="text-xs sm:text-sm text-gray-400">Real-time cryptocurrency prices and trends</p>
        </div>

        <ModernWatchlist />
      </div>
      <BottomNavigation />
      <Footer />
    </div>
  );
};

export default Home;
