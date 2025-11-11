import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExchangeAlt, FaWallet, FaInfoCircle, FaCheck } from "react-icons/fa";
import { authAPI } from "../../services/apiService";
import showToast from "../../utils/toast";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

const TransferPage = () => {
  const navigate = useNavigate();
  const [fromAccount, setFromAccount] = useState("funding");
  const [toAccount, setToAccount] = useState("trading");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setProfile(data);
      setBalance(data.balance || 0);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > balance) {
      showToast.error("Insufficient balance");
      return;
    }

    if (fromAccount === toAccount) {
      showToast.error("Cannot transfer to the same account");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement transfer API endpoint
      // const response = await authAPI.transferFunds({ fromAccount, toAccount, amount });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast.success("Transfer completed successfully!");
      setAmount("");
      fetchProfile();
    } catch (error) {
      showToast.error(error.response?.data?.error || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const accountOptions = [
    { value: "funding", label: "Funding Account", icon: "💰", balance: balance },
    { value: "trading", label: "Trading Account", icon: "📈", balance: profile?.inUseBalance || 0 },
    { value: "demo", label: "Demo Account", icon: "🎮", balance: profile?.demoBalance || 0 },
  ];

  const fromAccountData = accountOptions.find(acc => acc.value === fromAccount);
  const toAccountData = accountOptions.find(acc => acc.value === toAccount);

  const handleMaxClick = () => {
    setAmount(fromAccountData.balance.toFixed(2));
  };

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
              <h1 className="text-2xl font-bold text-white">Transfer Funds</h1>
              <p className="text-xs text-gray-400">Move funds between your accounts</p>
            </div>
          </div>

          {/* Transfer Card */}
          <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-6 mb-6">
            {/* From Account */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-3 block">From Account</label>
              <div className="space-y-2">
                {accountOptions.map((account) => (
                  <button
                    key={account.value}
                    onClick={() => setFromAccount(account.value)}
                    disabled={account.value === toAccount}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      fromAccount === account.value
                        ? "bg-teal-500/20 border-2 border-teal-500"
                        : "bg-gray-900/50 border border-gray-700 hover:border-gray-600"
                    } ${account.value === toAccount ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{account.icon}</div>
                        <div>
                          <div className="text-sm font-semibold text-white">{account.label}</div>
                          <div className="text-xs text-gray-400">
                            Balance: ${account.balance.toFixed(2)} USD
                          </div>
                        </div>
                      </div>
                      {fromAccount === account.value && (
                        <FaCheck className="text-teal-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Arrow */}
            <div className="flex justify-center my-4">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center">
                <FaExchangeAlt className="text-teal-400 text-xl" />
              </div>
            </div>

            {/* To Account */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-3 block">To Account</label>
              <div className="space-y-2">
                {accountOptions.map((account) => (
                  <button
                    key={account.value}
                    onClick={() => setToAccount(account.value)}
                    disabled={account.value === fromAccount}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      toAccount === account.value
                        ? "bg-teal-500/20 border-2 border-teal-500"
                        : "bg-gray-900/50 border border-gray-700 hover:border-gray-600"
                    } ${account.value === fromAccount ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{account.icon}</div>
                        <div>
                          <div className="text-sm font-semibold text-white">{account.label}</div>
                          <div className="text-xs text-gray-400">
                            Balance: ${account.balance.toFixed(2)} USD
                          </div>
                        </div>
                      </div>
                      {toAccount === account.value && (
                        <FaCheck className="text-teal-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-2 block">Transfer Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-lg font-semibold placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium hover:bg-teal-500/30 transition-all"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  Available: ${fromAccountData.balance.toFixed(2)} USD
                </span>
                {amount && parseFloat(amount) > 0 && (
                  <span className="text-xs text-gray-400">
                    You'll receive: ${parseFloat(amount).toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 space-y-1">
                  <div>• Transfers are instant and free</div>
                  <div>• No fees apply for account transfers</div>
                  <div>• Minimum transfer amount: $1.00 USD</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleTransfer}
              disabled={loading || !amount || parseFloat(amount) <= 0 || fromAccount === toAccount}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
            >
              {loading ? "Processing..." : "Confirm Transfer"}
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
};

export default TransferPage;

