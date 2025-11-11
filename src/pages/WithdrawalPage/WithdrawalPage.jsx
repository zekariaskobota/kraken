import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaWallet, FaLock, FaExclamationTriangle, FaInfoCircle, FaCheck } from "react-icons/fa";
import { withdrawalsAPI, authAPI, identityAPI, adminAPI } from "../../services/apiService";
import showToast from "../../utils/toast";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [fundPassword, setFundPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [identityStatus, setIdentityStatus] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [cryptoOptions, setCryptoOptions] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
  }, []);

  const fetchUserData = async () => {
    try {
      const profileResponse = await authAPI.getProfile();
      setBalance(profileResponse.balance || 0);

      const identityResponse = await identityAPI.getStatus();
      setIdentityStatus(identityResponse.status || "");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await adminAPI.getAllAddresses();
      
      let addressData = [];
      if (Array.isArray(response)) {
        addressData = response;
      } else if (response && response.addresses) {
        addressData = response.addresses;
      } else if (response && typeof response === 'object') {
        addressData = Object.values(response);
      }
      
      setAddresses(addressData);
      
      const cryptoMap = {};
      addressData.forEach(addr => {
        if (addr.cryptoType && addr.network) {
          if (!cryptoMap[addr.cryptoType]) {
            cryptoMap[addr.cryptoType] = {
              symbol: addr.cryptoType,
              name: addr.cryptoName || addr.cryptoType,
              networks: [],
              fee: 1
            };
          }
          if (!cryptoMap[addr.cryptoType].networks.includes(addr.network)) {
            cryptoMap[addr.cryptoType].networks.push(addr.network);
          }
        }
      });
      
      // Set fees
      Object.values(cryptoMap).forEach(crypto => {
        if (crypto.symbol === "BTC") crypto.fee = 0.0005;
        else if (crypto.symbol === "ETH") crypto.fee = 0.005;
        else if (crypto.symbol === "BNB") crypto.fee = 0.001;
        else crypto.fee = 1;
      });
      
      const options = Object.values(cryptoMap);
      setCryptoOptions(options);
      
      if (options.length > 0) {
        const firstCrypto = options[0];
        setSelectedCrypto(firstCrypto.symbol);
        if (firstCrypto.networks.length > 0) {
          setSelectedNetwork(firstCrypto.networks[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleCryptoChange = (crypto) => {
    setSelectedCrypto(crypto);
    const cryptoData = cryptoOptions.find(c => c.symbol === crypto);
    if (cryptoData?.networks?.length > 0) {
      setSelectedNetwork(cryptoData.networks[0]);
    }
  };

  const validateWithdrawal = () => {
    if (identityStatus !== "Verified") {
      showToast.error("Please verify your identity first");
      setTimeout(() => navigate("/settings?section=identity"), 1500);
      return false;
    }

    if (!withdrawAddress || withdrawAddress.trim() === "") {
      showToast.error("Please enter withdrawal address");
      return false;
    }

    if (!withdrawAmount || withdrawAmount <= 0) {
      showToast.error("Please enter a valid amount");
      return false;
    }

    const minWithdrawal = 10;

    if (parseFloat(withdrawAmount) < minWithdrawal) {
      showToast.error(`Minimum withdrawal is ${minWithdrawal} USD`);
      return false;
    }

    if (parseFloat(withdrawAmount) > balance) {
      showToast.error("Insufficient balance");
      return false;
    }

    return true;
  };

  const handleWithdrawClick = () => {
    if (!validateWithdrawal()) return;
    setShowPasswordModal(true);
  };

  const handleSubmit = async () => {
    if (!fundPassword) {
      showToast.error("Please enter your fund password");
      return;
    }

    setLoading(true);

    try {
      await authAPI.verifyFundPassword({ fundPassword });

      await withdrawalsAPI.withdraw({
        withdrawalAmount: parseFloat(withdrawAmount),
        cryptoType: selectedCrypto,
        network: selectedNetwork,
        address: withdrawAddress,
      });

      showToast.success("Withdrawal request submitted successfully!");
      
      setWithdrawAddress("");
      setWithdrawAmount("");
      setFundPassword("");
      setShowPasswordModal(false);
      
      setTimeout(() => navigate("/profile"), 1500);
    } catch (error) {
      showToast.error(error.response?.data?.error || "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  const selectedCryptoData = cryptoOptions.find(c => c.symbol === selectedCrypto);
  const receiveAmount = withdrawAmount ? (parseFloat(withdrawAmount) - (selectedCryptoData?.fee || 0)).toFixed(2) : "0.00";
  
  const getNetworkName = (network) => {
    const names = {
      "TRC20": "TRON (TRC-20)",
      "ERC20": "Ethereum (ERC-20)",
      "BEP20": "BSC (BEP-20)",
      "Bitcoin": "Bitcoin Network"
    };
    return names[network] || network;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20 pt-16 md:pt-20">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
              >
                <FaArrowLeft className="text-sm" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Withdraw Crypto</h1>
                <p className="text-xs md:text-sm text-gray-400">Send digital assets to external wallet</p>
              </div>
            </div>
          </div>

          {/* Balance Display */}
          <div className="bg-gray-800/50 rounded-xl p-4 md:p-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Available Balance</div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {balance.toFixed(2)} <span className="text-sm font-normal text-gray-400">USD</span>
                </div>
              </div>
              <FaWallet className="text-4xl text-gray-600" />
            </div>
          </div>

          {cryptoOptions.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-12 text-center">
              <FaWallet className="text-5xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Withdrawal Temporarily Unavailable</h3>
              <p className="text-sm text-gray-400 mb-4">Please check back soon or contact support.</p>
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-all"
              >
                Back to Assets
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Coin Selection */}
              <div className="bg-gray-800/50 rounded-xl p-4 md:p-5">
                <label className="text-xs text-gray-400 mb-2 block">Select Coin</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {cryptoOptions.map((crypto) => (
                    <button
                      key={crypto.symbol}
                      onClick={() => handleCryptoChange(crypto.symbol)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedCrypto === crypto.symbol
                          ? "bg-teal-500 text-white"
                          : "bg-gray-900/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
                      }`}
                    >
                      {crypto.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Selection */}
              <div className="bg-gray-800/50 rounded-xl p-4 md:p-5">
                <label className="text-xs text-gray-400 mb-3 block">Withdrawal Network</label>
                <div className="space-y-2">
                  {selectedCryptoData?.networks.map((network) => (
                    <button
                      key={network}
                      onClick={() => setSelectedNetwork(network)}
                      className={`w-full p-3 md:p-4 rounded-lg text-left transition-all ${
                        selectedNetwork === network
                          ? "bg-teal-500/20 border border-teal-500"
                          : "bg-gray-900/50 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{network}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {getNetworkName(network)} • Fee: {selectedCryptoData?.fee} {selectedCrypto}
                          </div>
                        </div>
                        {selectedNetwork === network && (
                          <FaCheck className="text-teal-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Withdrawal Form */}
              <div className="bg-gray-800/50 rounded-xl p-4 md:p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Withdrawal Details</h3>
                
                {/* Address */}
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-2 block">
                    Withdrawal Address
                  </label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder={`Enter ${selectedCrypto} address`}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all font-mono"
                  />
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-2 block">Amount (USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter withdrawal amount"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all pr-16"
                    />
                    <button
                      onClick={() => setWithdrawAmount(balance.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Fee Info */}
                {withdrawAmount && (
                  <div className="bg-gray-900/50 rounded-lg p-3 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Withdrawal Amount</span>
                      <span className="text-white">{withdrawAmount} {selectedCrypto}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Network Fee</span>
                      <span className="text-white">-{selectedCryptoData?.fee} {selectedCrypto}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                      <span className="text-white">You will receive</span>
                      <span className="text-teal-400">{receiveAmount} {selectedCrypto}</span>
                    </div>
                  </div>
                )}

                {/* Warnings */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <FaExclamationTriangle className="text-amber-400 text-sm flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div>• Minimum withdrawal: <span className="text-white font-semibold">10 USD</span></div>
                      <div>• Double-check address and network</div>
                      <div>• Withdrawals are irreversible</div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleWithdrawClick}
                  disabled={loading}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Withdraw"}
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-xs text-gray-300">
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="mb-1">Processing time: <span className="text-white font-semibold">24-48 hours</span></div>
                    <div>Identity verification is required for withdrawals</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fund Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                <FaLock className="text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Withdrawal</h3>
                <p className="text-xs text-gray-400">Enter your fund password</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-2 block">Fund Password</label>
              <input
                type="password"
                value={fundPassword}
                onChange={(e) => setFundPassword(e.target.value)}
                placeholder="Enter fund password"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && fundPassword) {
                    handleSubmit();
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setFundPassword("");
                }}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !fundPassword}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNavigation />
    </>
  );
};

export default WithdrawalPage;
