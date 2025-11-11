import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExchangeAlt, FaInfoCircle, FaArrowDown, FaArrowUp } from "react-icons/fa";
import axios from "axios";
import { authAPI } from "../../services/apiService";
import showToast from "../../utils/toast";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

const ConvertPage = () => {
  const navigate = useNavigate();
  const [fromCrypto, setFromCrypto] = useState("USDT");
  const [toCrypto, setToCrypto] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [balance, setBalance] = useState(0);
  const [cryptoRates, setCryptoRates] = useState({});

  const cryptos = [
    { symbol: "USDT", name: "Tether", icon: "💵", color: "bg-green-500/20 text-green-500" },
    { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "bg-orange-500/20 text-orange-500" },
    { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "bg-blue-500/20 text-blue-500" },
    { symbol: "BNB", name: "Binance Coin", icon: "🔶", color: "bg-yellow-500/20 text-yellow-500" },
    { symbol: "SOL", name: "Solana", icon: "◎", color: "bg-purple-500/20 text-purple-500" },
    { symbol: "XRP", name: "Ripple", icon: "💧", color: "bg-gray-500/20 text-gray-400" },
  ];

  useEffect(() => {
    fetchProfile();
    fetchCryptoRates();
  }, []);

  useEffect(() => {
    if (fromCrypto && toCrypto && fromCrypto !== toCrypto) {
      calculateExchangeRate();
    }
  }, [fromCrypto, toCrypto, cryptoRates]);

  useEffect(() => {
    if (amount && exchangeRate > 0) {
      calculateConversion();
    } else {
      setConvertedAmount(0);
    }
  }, [amount, exchangeRate]);

  const fetchProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchCryptoRates = async () => {
    try {
      const response = await axios.get("https://api.binance.com/api/v3/ticker/price");
      const rates = {};
      response.data.forEach((item) => {
        if (item.symbol.endsWith("USDT")) {
          const currency = item.symbol.replace("USDT", "");
          rates[currency] = parseFloat(item.price);
        }
      });
      rates["USDT"] = 1;
      setCryptoRates(rates);
    } catch (error) {
      console.error("Error fetching crypto rates:", error);
      // Fallback rates
      setCryptoRates({
        USDT: 1,
        BTC: 106000,
        ETH: 3500,
        BNB: 600,
        SOL: 150,
        XRP: 0.6,
      });
    }
  };

  const calculateExchangeRate = () => {
    setFetchingRate(true);
    try {
      const fromRate = cryptoRates[fromCrypto] || 1;
      const toRate = cryptoRates[toCrypto] || 1;
      
      if (fromCrypto === "USDT") {
        setExchangeRate(1 / toRate);
      } else if (toCrypto === "USDT") {
        setExchangeRate(fromRate);
      } else {
        // Convert from -> USDT -> to
        setExchangeRate(fromRate / toRate);
      }
    } catch (error) {
      console.error("Error calculating exchange rate:", error);
    } finally {
      setFetchingRate(false);
    }
  };

  const calculateConversion = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setConvertedAmount(0);
      return;
    }
    const result = parseFloat(amount) * exchangeRate;
    setConvertedAmount(result);
  };

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast.error("Please enter a valid amount");
      return;
    }

    if (fromCrypto === toCrypto) {
      showToast.error("Cannot convert to the same cryptocurrency");
      return;
    }

    // For now, we'll simulate the conversion
    // In a real app, this would call an API to update balances
    setLoading(true);

    try {
      // TODO: Implement convert API endpoint
      // const response = await authAPI.convertCrypto({ fromCrypto, toCrypto, amount });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast.success(`Successfully converted ${amount} ${fromCrypto} to ${convertedAmount.toFixed(8)} ${toCrypto}`);
      setAmount("");
      setConvertedAmount(0);
      fetchProfile();
    } catch (error) {
      showToast.error(error.response?.data?.error || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
    setAmount("");
    setConvertedAmount(0);
  };

  const handleMaxClick = () => {
    // In a real app, this would fetch the actual balance of fromCrypto
    setAmount(balance.toFixed(2));
  };

  const fromCryptoData = cryptos.find(c => c.symbol === fromCrypto);
  const toCryptoData = cryptos.find(c => c.symbol === toCrypto);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20 pt-16 md:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Convert Crypto</h1>
              <p className="text-xs text-gray-400">Exchange between cryptocurrencies</p>
            </div>
          </div>

          {/* Convert Card */}
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-6 mb-6">
            {/* From Crypto */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-3 block">From</label>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${fromCryptoData?.color} flex items-center justify-center text-xl font-bold`}>
                      {fromCryptoData?.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{fromCryptoData?.name}</div>
                      <div className="text-xs text-gray-400">{fromCrypto}</div>
                    </div>
                  </div>
                  <select
                    value={fromCrypto}
                    onChange={(e) => setFromCrypto(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                  >
                    {cryptos.map((crypto) => (
                      <option key={crypto.symbol} value={crypto.symbol}>
                        {crypto.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-lg font-semibold placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all"
                  />
                  <button
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium hover:bg-teal-500/30 transition-all"
                  >
                    MAX
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Balance: ${balance.toFixed(2)} USD
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={handleSwap}
                className="w-12 h-12 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center hover:bg-teal-500/30 transition-all"
              >
                <FaExchangeAlt className="text-teal-400 text-xl" />
              </button>
            </div>

            {/* To Crypto */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-3 block">To</label>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${toCryptoData?.color} flex items-center justify-center text-xl font-bold`}>
                      {toCryptoData?.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{toCryptoData?.name}</div>
                      <div className="text-xs text-gray-400">{toCrypto}</div>
                    </div>
                  </div>
                  <select
                    value={toCrypto}
                    onChange={(e) => setToCrypto(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                  >
                    {cryptos.map((crypto) => (
                      <option key={crypto.symbol} value={crypto.symbol}>
                        {crypto.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {convertedAmount > 0 ? convertedAmount.toFixed(8) : "0.00"}
                  </div>
                  {fetchingRate && (
                    <div className="text-xs text-gray-500 mt-1">Fetching rate...</div>
                  )}
                  {!fetchingRate && exchangeRate > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      1 {fromCrypto} = {exchangeRate.toFixed(8)} {toCrypto}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exchange Rate Info */}
            {exchangeRate > 0 && !fetchingRate && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white font-semibold">
                    1 {fromCrypto} = {exchangeRate.toFixed(8)} {toCrypto}
                  </span>
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-blue-500/20">
                    <span className="text-gray-400">You'll receive</span>
                    <span className="text-teal-400 font-semibold">
                      {convertedAmount.toFixed(8)} {toCrypto}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 space-y-1">
                  <div>• Conversions use real-time market rates</div>
                  <div>• Small conversion fee may apply (0.1%)</div>
                  <div>• Minimum conversion amount: $1.00 USD</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConvert}
              disabled={loading || !amount || parseFloat(amount) <= 0 || fromCrypto === toCrypto || convertedAmount <= 0}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
            >
              {loading ? "Converting..." : "Confirm Conversion"}
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
};

export default ConvertPage;

