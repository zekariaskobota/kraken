import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { FaTimes, FaWallet, FaChartLine } from "react-icons/fa";
import config from "../../config";
import showToast from "../../utils/toast";

const TradePopup = ({ cryptoData, isOpen, onClose, tradeType }) => {
  const navigate = useNavigate();
  const [tradeAmount, setTradeAmount] = useState("");
  const [expirationTime, setExpirationTime] = useState(null);
  const [highlightedButton, setHighlightedButton] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(cryptoData?.current_price || 0);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [selectedLabel, setSelectedLabel] = useState("");
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const [userWinLose, setUserWinLose] = useState("Off");
  const [userIdentityStatus, setUserIdentityStatus] = useState("Unidentified");
  const [isCounting, setIsCounting] = useState(false);
  const [countSeconds, setCountSeconds] = useState(0);
  const expirationOptions = [
    { label: "30s", percentage: 12, minTradeAmount: 500, maxTradeAmount: 5000 },
    { label: "60s", percentage: 15, minTradeAmount: 5000, maxTradeAmount: 20000 },
    { label: "90s", percentage: 18, minTradeAmount: 20000, maxTradeAmount: 50000 },
    { label: "120s", percentage: 21, minTradeAmount: 50000, maxTradeAmount: 90000 },
    { label: "180s", percentage: 24, minTradeAmount: 90000, maxTradeAmount: 200000 },
    { label: "360s", percentage: 27, minTradeAmount: 200000, maxTradeAmount: 1000000 },
  ];

  const estimatedIncome =
    tradeAmount && expirationTime
      ? (tradeAmount * (expirationTime / 100)).toFixed(2)
      : 0;

  useEffect(() => {
    // Update current price when cryptoData changes
    if (cryptoData?.current_price) {
      setCurrentPrice(cryptoData.current_price);
    }
  }, [cryptoData]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setBalance(data.balance || 0);
        } else {
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const email = decoded.email;

      fetch(`${config.BACKEND_URL}/api/auth/me/${email}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setBalance(data.balance);
          setUserId(decoded.id);
          setUserWinLose(data.winLose);
          setUserIdentityStatus(data.status);
        })
        .catch((error) => {
          // Error handling
        });
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0) {
      setIsCounting(false);
      submitTrade();
    }

    return () => clearTimeout(countdownRef.current);
  }, [countdown]);

  const resetTradeState = () => {
    setTradeAmount("");
    setCountdown(null);
    setIsCounting(false);
    setIsAuthenticating(false);
    setExpirationTime(null);
    setSelectedLabel("");
    setHighlightedButton(null);
  };

  const submitTrade = async () => {
    if (userIdentityStatus !== "Verified") {
      resetTradeState();
      showToast.error("Please verify your identity to trade!");
      setTimeout(() => navigate("/real-name-authentication"), 1500);
      return;
    }

    if (tradeAmount > balance) {
      showToast.error("Insufficient balance. Please deposit to trade!");
      resetTradeState();
      return;
    }

    const selectedExpiration = expirationOptions.find(
      (option) => option.label === selectedLabel
    );

    if (!selectedExpiration) {
      showToast.error("Invalid expiration option selected");
      return;
    }

    if (tradeAmount < selectedExpiration.minTradeAmount) {
      showToast.error(`Trade amount must be at least ${selectedExpiration.minTradeAmount} USD`);
      return;
    }

    if (tradeAmount > selectedExpiration.maxTradeAmount) {
      showToast.error(`Trade amount cannot exceed ${selectedExpiration.maxTradeAmount} USD`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast.warning("User is not authenticated");
        return;
      }
      let winLose = "Lose"; 
      if (userWinLose === "On") {
        winLose = "Win";
      } else {
        winLose = "Lose";
      }

      const tradeData = {
        userId,
        selectedPair: cryptoData.name,
        currentPrice,
        tradeType,
        expirationTime: selectedLabel,
        tradeAmount,
        estimatedIncome,
        winLose
      };

      const response = await fetch(`${config.BACKEND_URL}/api/trades/trade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tradeData),
      });

      if (response.ok) {
        let newBalance = 0;

        const numericBalance = parseFloat(balance);
        const numericEstimatedIncome = parseFloat(estimatedIncome);

        if (userWinLose === "Off") {
          newBalance = numericBalance - numericEstimatedIncome - 0.5;
        } else {
          newBalance = numericBalance + numericEstimatedIncome - 0.5;
        }

        setBalance(newBalance);

        const updateBalanceResponse = await fetch(
          `${config.BACKEND_URL}/api/auth/update-balance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, newBalance }),
          }
        );

        if (!updateBalanceResponse.ok) {
          // Error handling
        }

        showToast.success("Trade submitted successfully!");
        resetTradeState();
        onClose();
      } else {
        showToast.error("Failed to submit trade");
      }
    } catch (error) {
      showToast.error("Error submitting trade");
    }
  };

  const handleCountSecond = async () => {
    const selected = expirationOptions.find(
      (opt) => opt.label === selectedLabel
    );
    if (!selected) return;

    const seconds = parseInt(selected.label.replace("s", ""));
    setCountdown(seconds);
    setIsCounting(true);
    setCountSeconds(seconds);
  };

  const selectedExpiration = expirationOptions.find(
    (option) => option.percentage === expirationTime
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-end justify-center z-[1000] bg-black/75 backdrop-blur-sm animate-[fadeIn_0.3s_ease]" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border border-[#2a2d3a] rounded-t-3xl sm:rounded-t-[24px] w-full max-w-[600px] h-[75vh] sm:h-[90vh] max-h-[75vh] sm:max-h-[90vh] mb-6 sm:mb-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 animate-[slideUp_0.3s_ease] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(20, 184, 166, 0.3) transparent'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4 sm:mb-6 pb-4 sm:pb-5 border-b border-[#2a2d3a]">
          <div className="flex-1">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-semibold sm:font-bold text-white mb-1 sm:mb-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              {tradeType === "Buy" ? "Buy" : "Sell"} {cryptoData.name}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              <span className="text-[10px] sm:text-xs opacity-60">USD</span> {cryptoData?.current_price ? cryptoData.current_price.toFixed(2) : cryptoData?.symbol}
            </p>
          </div>
          <button 
            className="bg-[rgba(42,45,58,0.8)] border border-[#2a2d3a] text-white w-7 h-7 sm:w-8 sm:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 text-sm sm:text-base hover:bg-red-500/20 hover:border-red-500 hover:text-red-500 hover:scale-110" 
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {/* Balance Info */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <FaWallet className="text-teal-400 bg-teal-500/15 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg" />
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Available Balance</span>
              <span className="text-base sm:text-lg md:text-xl font-bold text-white"><span className="text-xs opacity-60">USD</span> {balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Trade Amount Input */}
        <div className="mb-4 sm:mb-6">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3">Trade Amount (USDT)</label>
          <div className="flex flex-col gap-3">
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              placeholder="Enter amount in USDT"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-4 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl text-white text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] focus:shadow-[0_0_0_3px_rgba(38,166,154,0.1)] placeholder:text-gray-600"
              required
            />
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <button 
                  key={percent}
                  className="px-2 sm:px-2.5 py-1.5 sm:py-2.5 bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-lg text-gray-400 text-[10px] sm:text-xs font-medium cursor-pointer transition-all duration-300 hover:bg-teal-500/10 hover:border-teal-500 hover:text-teal-400"
                  onClick={() => setTradeAmount((balance * (percent / 100)).toFixed(2))}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>
          {/* Display equivalent crypto amount */}
          {tradeAmount && currentPrice && parseFloat(tradeAmount) > 0 && (
            <div className="mt-2 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-xs text-teal-400">
              Equivalent: {((parseFloat(tradeAmount) || 0) / currentPrice).toFixed(8)} {cryptoData?.name || cryptoData?.symbol?.replace('USDT', '') || ''}
            </div>
          )}
        </div>

        {/* Expiration Time Selection */}
        <div className="mb-4 sm:mb-6">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3">
            <FaChartLine className="text-teal-400 text-sm sm:text-base" />
            Select Expiration Time
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {expirationOptions.map((option, index) => (
              <button
                key={index}
                className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
                  highlightedButton === index 
                    ? "bg-teal-500/15 border-teal-500 shadow-[0_4px_12px_rgba(38,166,154,0.2)]" 
                    : "bg-[rgba(26,29,41,0.6)] border-[#2a2d3a] hover:bg-[rgba(26,29,41,0.9)] hover:border-teal-500 hover:-translate-y-0.5"
                }`}
                onClick={() => {
                  setExpirationTime(option.percentage);
                  setSelectedLabel(option.label);
                  setHighlightedButton(index);
                }}
              >
                <span className="text-xs sm:text-sm md:text-base font-semibold text-white">{option.label}</span>
                <span className="text-xs sm:text-sm text-teal-400 font-semibold">{option.percentage}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Min/Max Amounts */}
        {selectedExpiration && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Minimum</span>
                <span className="text-sm sm:text-base font-semibold text-white"><span className="text-xs opacity-60">USD</span> {selectedExpiration.minTradeAmount.toLocaleString()}</span>
              </div>
              <div className="w-px h-10 bg-[#2a2d3a]"></div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Maximum</span>
                <span className="text-sm sm:text-base font-semibold text-white"><span className="text-xs opacity-60">USD</span> {selectedExpiration.maxTradeAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Countdown Timer */}
        {isCounting && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs sm:text-sm text-gray-400">Confirming in</span>
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-teal-400">{countdown}s</span>
              </div>
              <div className="w-full h-2 bg-[rgba(11,14,20,0.6)] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${((countSeconds - countdown) / countSeconds) * 100}%` }}
                ></div>
              </div>
              <button 
                className="w-full px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-red-500/20 hover:border-red-500" 
                onClick={resetTradeState}
              >
                Cancel Trade
              </button>
            </div>
          </div>
        )}

        {/* Estimated Income */}
        {estimatedIncome > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 sm:p-5 flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-400 font-medium">Estimated Income</span>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-teal-400">+<span className="text-sm opacity-60">USD</span> {estimatedIncome}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            className={`w-full px-4 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 border-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              tradeType.toLowerCase() === 'buy'
                ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-[0_4px_12px_rgba(38,166,154,0.3)] hover:shadow-[0_8px_20px_rgba(38,166,154,0.4)] hover:-translate-y-0.5'
                : 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_4px_12px_rgba(239,83,80,0.3)] hover:shadow-[0_8px_20px_rgba(239,83,80,0.4)] hover:-translate-y-0.5'
            }`}
            onClick={handleCountSecond}
            disabled={loading || !tradeAmount || !expirationTime || isCounting}
          >
            {tradeType} {cryptoData.name}
          </button>
          <button
            className="w-full px-4 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 border-none flex items-center justify-center gap-2 bg-[rgba(42,45,58,0.6)] border border-[#2a2d3a] text-gray-400 hover:bg-[rgba(42,45,58,0.8)] hover:border-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isCounting}
          >
            Cancel
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default TradePopup;
