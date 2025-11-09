import React, { useState, useEffect, useRef } from "react";
import { FaCopy, FaArrowDown, FaArrowUp, FaExchangeAlt, FaGlobe, FaWallet, FaClock, FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, depositsAPI, withdrawalsAPI, identityAPI, adminAPI } from "../../services/apiService";
import axios from "axios";
import Swal from "sweetalert2";

const PersonalCenter = ({ showDepositModal: externalShowDepositModal, showWithdrawModal: externalShowWithdrawModal, onCloseModals }) => {
  const [internalShowDepositModal, setInternalShowDepositModal] = useState(false);
  const [internalShowWithdrawModal, setInternalShowWithdrawModal] = useState(false);
  
  // Use external props if provided, otherwise use internal state
  const showDepositModal = externalShowDepositModal !== undefined ? externalShowDepositModal : internalShowDepositModal;
  const showWithdrawModal = externalShowWithdrawModal !== undefined ? externalShowWithdrawModal : internalShowWithdrawModal;
  
  const setShowDepositModal = (value) => {
    if (externalShowDepositModal === undefined) {
      setInternalShowDepositModal(value);
    } else if (!value && onCloseModals) {
      onCloseModals();
    }
  };
  
  const setShowWithdrawModal = (value) => {
    if (externalShowWithdrawModal === undefined) {
      setInternalShowWithdrawModal(value);
    } else if (!value && onCloseModals) {
      onCloseModals();
    }
  };

  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawNetwork, setWithdrawNetwork] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositProof, setDepositProof] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [profile, setProfile] = useState(null);
  const [identityStatus, setIdentityStatus] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState("");
  const [isAuthPopupOpen, setAuthPopupOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [fundPassword, setFundPassword] = useState("");
  const [cryptoRates, setCryptoRates] = useState({});
  const [walletStats, setWalletStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  });
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [currencyRates, setCurrencyRates] = useState({});
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const currencyDropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    try {
      const data = await adminAPI.getAllAddresses();
      setAddresses(data);
    } catch (error) {
      // Error handling without console.log
    }
  };

  const fetchCryptoRates = async () => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/price"
      );
      const data = await response.json();

      const rates = {};
      data.forEach((item) => {
        const symbol = item.symbol;
        const price = parseFloat(item.price);
        if (symbol === "BTCUSDT") rates.BTC = price;
        if (symbol === "ETHUSDT") rates.ETH = price;
        if (symbol === "BNBUSDT") rates.BNB = price;
        if (symbol === "USDTUSDT") rates.USDT = price;
      });

      setCryptoRates(rates);
    } catch (error) {
      // Error handling without console.log
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchCryptoRates();
    fetchCurrencyRates();
    const ratesInterval = setInterval(fetchCurrencyRates, 30000); // Fetch rates every 30 seconds
    return () => clearInterval(ratesInterval);
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
      // Error handling
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
    if (!profile || !profile.balance) return 0;
    if (selectedCurrency === "USDT") {
      return profile.balance;
    }
    return convertBalance(profile.balance, "USDT", selectedCurrency);
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
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authAPI.getProfile();
        setProfile(data);
        setIdentityStatus(data.status);
      } catch (error) {
        navigate("/");
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchWalletStats = async () => {
      if (!profile) return;
      
      try {
        const [depositsData, withdrawalsData] = await Promise.all([
          depositsAPI.getUserDeposits(),
          withdrawalsAPI.getAllWithdrawals(),
        ]);

        const deposits = depositsData.deposits || [];
        const withdrawals = withdrawalsData.withdrawals || [];

        const totalDeposits = deposits
          .filter((d) => d.status === "Approved")
          .reduce((sum, d) => sum + (d.amount || 0), 0);

        const totalWithdrawals = withdrawals
          .filter((w) => w.status === "Approved")
          .reduce((sum, w) => sum + (w.amount || 0), 0);

        const pendingDeposits = deposits
          .filter((d) => d.status === "Pending")
          .reduce((sum, d) => sum + (d.amount || 0), 0);

        const pendingWithdrawals = withdrawals
          .filter((w) => w.status === "Pending")
          .reduce((sum, w) => sum + (w.amount || 0), 0);

        setWalletStats({
          totalDeposits,
          totalWithdrawals,
          pendingDeposits,
          pendingWithdrawals,
        });
      } catch (error) {
        // Error handling
      }
    };

    fetchWalletStats();
  }, [profile]);

  const handleCryptoChange = (event) => {
    const selected = event.target.value;
    setSelectedCrypto(selected);
    const selectedAddress =
      addresses.find((addr) => addr.cryptoType === selected)?.address || "";
    setAddress(selectedAddress);
  };

  const handleDeposit = async () => {
    setDepositLoading(true);
    const parsedAmount = parseFloat(depositAmount);
    const rate = cryptoRates[selectedCrypto] || 1;
    let equivalentInUSDT = parsedAmount;

    if (selectedCrypto !== "USDT") {
      equivalentInUSDT = parsedAmount * rate;
    }

    const formData = new FormData();
    formData.append("cryptoType", selectedCrypto);
    formData.append("cryptoAddress", address);
    formData.append("amount", parsedAmount);
    formData.append("equivalentInUSDT", equivalentInUSDT);
    formData.append("proofOfDeposit", depositProof);

    try {
      const { balance } = await depositsAPI.createDeposit(formData);
      Swal.fire({
        icon: "success",
        title: "Deposit Successful!",
        text: "Your deposit has been submitted successfully.",
        confirmButtonColor: "#22c55e",
      });
      setProfile((prev) => ({ ...prev, balance }));
      setDepositAmount("");
      setDepositProof(null);
      setShowDepositModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Deposit Failed",
        text: error.message || "Something went wrong. Please try again later.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdrawalSubmit = () => {
    if (loading || isAuthenticating) return;
    setAuthPopupOpen(true);
  };

  const resetAuthState = () => {
    setAuthPopupOpen(false);
    setFundPassword("");
    setAuthError("");
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    let minimumWithdrawalAmount = 15;

    if (withdrawAmount < minimumWithdrawalAmount) {
      Swal.fire({
        icon: "warning",
        title: "Withdrawal Amount Too Low",
        text: `The minimum withdrawal amount is ${minimumWithdrawalAmount}. Please enter a valid amount.`,
        confirmButtonText: "Okay",
      });

      setWithdrawLoading(false);
      return;
    }

    try {
      const { balance } = await withdrawalsAPI.withdraw({
        amount: parseFloat(withdrawAmount),
        withdrawalAddress: withdrawAddress,
        withdrawalNetwork: withdrawNetwork,
      });
      
      Swal.fire({
        icon: "success",
        title: "Withdrawal Successful!",
        text: "Your withdrawal has been processed successfully.",
        confirmButtonColor: "#22c55e",
      });
      setProfile((prev) => ({ ...prev, balance }));
      setWithdrawAmount("");
      setWithdrawAddress("");
      setShowWithdrawModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Withdrawal Failed",
        text: error.message || "Something went wrong. Please try again later.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!identityStatus || identityStatus !== "Verified") {
    const message = identityStatus
      ? `${identityStatus}`
      : "Identity status not found. Please verify your identity to view your wallet.";

    return (
      <div className="w-full bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-8 text-center">
        <h3 className="text-base sm:text-lg font-medium sm:font-semibold text-white mb-2">Identification Required</h3>
        <div
          className={`inline-block px-3 py-1.5 rounded-lg text-xs font-medium mb-3 ${
            identityStatus === "Pending"
              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
              : "bg-red-500/20 text-red-500 border border-red-500/30"
          }`}
        >
          {message}
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          Please verify your identity to view your wallet and trade
        </p>
      </div>
    );
  }

  const handleAuthSubmit = async () => {
    if (loading || isAuthenticating) return;
    setAuthError("");
    setLoading(true);

    try {
      await authAPI.verifyFundPassword(fundPassword);
      setIsAuthenticating(true);
      setAuthPopupOpen(false);
      handleWithdraw();
    } catch (error) {
      setAuthError(error.message || "Incorrect password. Please try again.");
      setFundPassword("");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    Swal.fire({
      icon: "success",
      title: "Copied to Clipboard!",
      text: `${selectedCrypto} address has been copied to your clipboard.`,
      confirmButtonColor: "#22c55e",
    });
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Verified") {
      return "bg-green-500/20 text-green-500 border-green-500/30";
    } else if (status === "Pending") {
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    }
    return "bg-red-500/20 text-red-500 border-red-500/30";
  };

  return (
    <div className="w-full max-w-full p-0 box-border overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:gap-6 w-full">
        {/* Profile Header - Modern Design */}
        <div className="relative p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <img
                src="/profile.png"
                alt="Profile"
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-teal-500/50 object-cover shadow-2xl ring-2 ring-teal-500/20"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                {profile.firstName} {profile.lastName || profile.email}
              </h3>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusBadgeClass(
                    profile.status
                  )}`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    profile.status === "Verified" ? "bg-green-500" :
                    profile.status === "Pending" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                  }`}></div>
                  {profile.status}
                </div>
                <span className="bg-[rgba(26,29,41,0.8)] backdrop-blur-sm border border-[#2a2d3a] px-3 py-1 rounded-lg text-xs text-gray-300 font-medium">
                  <span className="text-gray-500">UID:</span>{" "}
                  <span className="text-teal-400 font-mono">{profile.userId || profile._id?.substring(0, 8).toUpperCase()}</span>
                </span>
              </div>
              <p className="text-xs text-gray-400">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Main Balance Card - No Background */}
        <div className="relative p-6 sm:p-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-teal-300/80 uppercase tracking-wider mb-2 font-medium">
                  Total Balance
                </div>
                <div className="flex items-baseline gap-0 mb-1">
                  <div className="flex items-baseline gap-1">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                      {isBalanceVisible 
                        ? getConvertedBalance().toFixed(selectedCurrency === "BTC" ? 8 : selectedCurrency === "ETH" ? 6 : 2)
                        : "****"
                      }
                    </div>
                    <button
                      onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                      className="text-teal-200/60 hover:text-teal-300 transition-colors duration-200 p-1"
                      aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
                    >
                      {isBalanceVisible ? (
                        <FaEye className="text-xs sm:text-sm" />
                      ) : (
                        <FaEyeSlash className="text-xs sm:text-sm" />
                      )}
                    </button>
                  </div>
                  {/* Currency Dropdown */}
                  <div className="relative" ref={currencyDropdownRef}>
                    <button
                      onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                      className="flex items-center gap-0.5 px-1 py-0 rounded-lg text-xs md:text-sm text-teal-200/80 font-medium hover:text-teal-300 hover:bg-teal-500/10 transition-all duration-200"
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
                </div>
                <div className="text-xs sm:text-sm text-teal-200/60 font-medium">
                  Available Balance
                </div>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/20 backdrop-blur-sm flex items-center justify-center border border-teal-400/30">
                <FaWallet className="text-2xl sm:text-3xl text-teal-300" />
              </div>
            </div>
            
            {/* Quick Action Buttons - No Background */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={() => setShowDepositModal(true)}
                className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
                disabled={depositLoading}
              >
                <div className="w-12 h-12 rounded-full bg-teal-700/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaArrowDown className="text-teal-300 text-lg" />
                </div>
                <span className="text-xs sm:text-sm font-normal text-white">Deposit</span>
              </button>
              
              <button
                onClick={() => navigate("/trade")}
                className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 rounded-full bg-teal-700/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaExchangeAlt className="text-teal-300 text-lg" />
                </div>
                <span className="text-xs sm:text-sm font-normal text-white">Trade</span>
              </button>
              
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
                disabled={withdrawLoading}
              >
                <div className="w-12 h-12 rounded-full bg-teal-700/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaArrowUp className="text-teal-300 text-lg" />
                </div>
                <span className="text-xs sm:text-sm font-normal text-white">Withdraw</span>
              </button>
              
              <button
                onClick={() => navigate("/market")}
                className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 rounded-full bg-teal-700/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaGlobe className="text-teal-300 text-lg" />
                </div>
                <span className="text-xs sm:text-sm font-normal text-white">Markets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[rgba(26,29,41,0.8)] border border-[#2a2d3a] rounded-xl p-4 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FaArrowDown className="text-green-400 text-sm" />
              </div>
              <span className="text-xs text-gray-400">Total Deposits</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              ${walletStats.totalDeposits.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-[rgba(26,29,41,0.8)] border border-[#2a2d3a] rounded-xl p-4 hover:border-red-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <FaArrowUp className="text-red-400 text-sm" />
              </div>
              <span className="text-xs text-gray-400">Total Withdrawals</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              ${walletStats.totalWithdrawals.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-[rgba(26,29,41,0.8)] border border-[#2a2d3a] rounded-xl p-4 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <FaClock className="text-yellow-400 text-sm" />
              </div>
              <span className="text-xs text-gray-400">Pending Deposits</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              ${walletStats.pendingDeposits.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-[rgba(26,29,41,0.8)] border border-[#2a2d3a] rounded-xl p-4 hover:border-orange-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <FaClock className="text-orange-400 text-sm" />
              </div>
              <span className="text-xs text-gray-400">Pending Withdrawals</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              ${walletStats.pendingWithdrawals.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 flex items-end justify-center z-[1000] bg-black/70 backdrop-blur-sm p-0 animate-[fadeIn_0.3s_ease]">
          <div className="bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] rounded-t-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl text-gray-300 relative animate-[slideUp_0.3s_ease]">
            <div className="flex justify-between items-start mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#2a2d3a]">
              <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent m-0">
                Deposit
              </h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="bg-[rgba(42,45,58,0.8)] border border-[#2a2d3a] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 text-sm sm:text-base hover:bg-red-500/20 hover:border-red-500 hover:text-red-500 hover:scale-110"
              >
                ×
              </button>
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-[10px] sm:text-xs text-gray-300 mb-1 sm:mb-1.5 font-medium">
                Select Cryptocurrency
              </label>
              <select
                value={selectedCrypto}
                onChange={handleCryptoChange}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-[10px] sm:text-xs transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)]"
              >
                <option value="">Select Cryptocurrency</option>
                {addresses.map((addr) => (
                  <option key={addr.cryptoType} value={addr.cryptoType}>
                    {addr.cryptoName}
                  </option>
                ))}
              </select>
            </div>
            {address && (
              <div className="flex items-center gap-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 mb-3 sm:mb-4">
                <span className="flex-1 break-all text-gray-300 text-[10px] sm:text-xs font-mono">
                  {address}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="bg-teal-500/15 border border-teal-500/30 text-teal-500 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md cursor-pointer transition-all duration-200 flex-shrink-0 hover:bg-teal-500/25 hover:border-teal-500 text-[10px] sm:text-xs"
                >
                  <FaCopy />
                </button>
              </div>
            )}
            <div className="mb-3 sm:mb-4">
              <label className="block text-[10px] sm:text-xs text-gray-300 mb-1 sm:mb-1.5 font-medium">
                Amount to Deposit
              </label>
              <input
                type="number"
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-[10px] sm:text-xs transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-[10px] sm:text-xs text-gray-300 mb-1 sm:mb-1.5 font-medium">
                Proof of Deposit
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-gray-300 text-[10px] sm:text-xs cursor-pointer transition-all duration-200 hover:border-teal-500 hover:bg-[rgba(11,14,20,0.8)] file:mr-2 sm:file:mr-3 file:py-0.5 sm:file:py-1 file:px-1.5 sm:file:px-2 file:rounded-md file:border-0 file:text-[9px] sm:file:text-xs file:font-medium file:bg-teal-500/15 file:text-teal-500 file:border file:border-teal-500/30 file:cursor-pointer hover:file:bg-teal-500/25 hover:file:border-teal-500"
                onChange={(e) => setDepositProof(e.target.files[0])}
              />
            </div>
            <button
              onClick={handleDeposit}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-medium text-white border-none cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              disabled={depositLoading}
            >
              {depositLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white"></div>
                  <span className="text-[10px] sm:text-xs">Processing...</span>
                </>
              ) : (
                <span className="text-[10px] sm:text-xs">Confirm Deposit</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 flex items-end justify-center z-[1000] bg-black/70 backdrop-blur-sm p-0 animate-[fadeIn_0.3s_ease]">
          <div className="bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] rounded-t-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl text-gray-300 relative animate-[slideUp_0.3s_ease]">
            <div className="flex justify-between items-start mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#2a2d3a]">
              <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent m-0">
                Withdraw USDT
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="bg-[rgba(42,45,58,0.8)] border border-[#2a2d3a] text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 text-base hover:bg-red-500/20 hover:border-red-500 hover:text-red-500 hover:scale-110"
              >
                ×
              </button>
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-[10px] sm:text-xs text-gray-300 mb-1 sm:mb-1.5 font-medium">
                Select Network
              </label>
              <select
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-[10px] sm:text-xs transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)]"
                value={withdrawNetwork}
                onChange={(e) => setWithdrawNetwork(e.target.value)}
              >
                <option value="">Select Network</option>
                <option value="TRC20">TRC20 (Tron)</option>
                <option value="ERC20">ERC20 (Ethereum)</option>
                <option value="BEP20">BEP20 (Binance Smart Chain)</option>
                <option value="XRP">XRP (Ripple)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="DOGE">DOGE (Dogecoin)</option>
              </select>
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-[10px] sm:text-xs text-gray-300 mb-1 sm:mb-1.5 font-medium">
                Withdrawal Address
              </label>
              <input
                type="text"
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-[10px] sm:text-xs transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                placeholder="Enter withdrawal address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
              />
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-[10px] sm:text-xs text-gray-300 mb-1 sm:mb-1.5 font-medium">
                Amount
              </label>
              <input
                type="number"
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-[10px] sm:text-xs transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
                placeholder="Enter withdrawal amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <button
              onClick={handleWithdrawalSubmit}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-medium text-white border-none cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={withdrawLoading}
            >
              {withdrawLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white"></div>
                  <span className="text-[10px] sm:text-xs">Processing...</span>
                </>
              ) : (
                <span className="text-[10px] sm:text-xs">Confirm Withdrawal</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Authentication Popup */}
      {isAuthPopupOpen && (
        <div className="fixed inset-0 flex items-end justify-center z-[1100] bg-black/70 backdrop-blur-sm p-0 animate-[fadeIn_0.3s_ease]">
          <div className="bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] rounded-t-2xl p-4 sm:p-6 w-full max-w-sm shadow-2xl text-gray-300 animate-[slideUp_0.3s_ease]">
            <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white mb-3 sm:mb-4">Enter Fund Password</h3>
            <input
              type="password"
              value={fundPassword}
              onChange={(e) => setFundPassword(e.target.value)}
              placeholder="Enter fund password"
              className="w-full px-3 py-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-[10px] sm:text-xs mb-3 transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-600"
              required
            />
            {authError && (
              <p className="text-red-500 text-[10px] sm:text-xs mb-3">{authError}</p>
            )}
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-[10px] sm:text-xs cursor-pointer transition-all duration-300 border-none bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleAuthSubmit}
                disabled={loading || isAuthenticating}
              >
                {isAuthenticating ? "Authenticating..." : "Authenticate"}
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-lg font-medium text-xs cursor-pointer transition-all duration-300 bg-[rgba(42,45,58,0.6)] border border-[#2a2d3a] text-gray-400 hover:bg-red-500/20 hover:border-red-500 hover:text-red-500"
                onClick={resetAuthState}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalCenter;
