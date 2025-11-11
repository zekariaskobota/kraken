import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp, FaExchangeAlt, FaEye, FaEyeSlash, FaChevronRight, FaSync } from "react-icons/fa";
import { RiExchangeLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { authAPI, depositsAPI, withdrawalsAPI } from "../../services/apiService";

const PersonalProfileNew = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account"); // 'account' or 'asset'
  const [walletStats, setWalletStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    todayPnL: 0,
    todayPnLPercent: 0,
  });
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchWalletStats();
    fetchAssets();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletStats = async () => {
    try {
      const [depositsData, withdrawalsData] = await Promise.all([
        depositsAPI.getUserDeposits(),
        withdrawalsAPI.getAllWithdrawals(),
      ]);

      const deposits = depositsData.deposits || [];
      const withdrawals = withdrawalsData.withdrawals || [];

      // Calculate total deposits in USD (using equivalentInUSDT which is the converted USD value)
      const totalDeposits = deposits
        .filter((d) => d.status === "Approved")
        .reduce((sum, d) => sum + (d.equivalentInUSDT || d.amount || 0), 0);

      const totalWithdrawals = withdrawals
        .filter((w) => w.status === "Approved")
        .reduce((sum, w) => sum + (w.amount || 0), 0);

      // Calculate today's PnL (mock for now)
      const todayPnL = 0.04;
      const todayPnLPercent = 0.02;

      setWalletStats({
        totalDeposits,
        totalWithdrawals,
        todayPnL,
        todayPnLPercent,
      });
    } catch (error) {
      console.error("Error fetching wallet stats:", error);
    }
  };

  const fetchAssets = async () => {
    try {
      const depositsData = await depositsAPI.getUserDeposits();
      const deposits = depositsData.deposits || [];

      // Group deposits by crypto type
      const assetMap = {};
      
      deposits
        .filter((d) => d.status === "Approved")
        .forEach((deposit) => {
          const cryptoType = deposit.cryptoType || "USDT";
          // Use equivalentInUSDT (USD value after conversion) for total USD
          const equivalentUSD = deposit.equivalentInUSDT || deposit.amount || 0;
          // Original amount is what user deposited (could be in crypto or USD)
          const originalAmount = deposit.amount || 0;

          if (!assetMap[cryptoType]) {
            assetMap[cryptoType] = {
              cryptoType,
              totalAmount: 0,
              totalUSD: 0,
              deposits: [],
            };
          }

          assetMap[cryptoType].totalAmount += originalAmount;
          assetMap[cryptoType].totalUSD += equivalentUSD;
          assetMap[cryptoType].deposits.push(deposit);
        });

      // Convert to array and add crypto names
      const assetsList = Object.values(assetMap).map((asset) => ({
        ...asset,
        cryptoName: getCryptoName(asset.cryptoType),
        pnl: 0, // Can be calculated based on current prices vs deposit prices
        pnlPercent: 0,
      }));

      setAssets(assetsList);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const getCryptoName = (type) => {
    const names = {
      USDT: "Tether USDT",
      BTC: "Bitcoin",
      ETH: "Ethereum",
      BNB: "Binance Coin",
      USDC: "USD Coin",
      XRP: "Ripple",
      ADA: "Cardano",
      DOGE: "Dogecoin",
      SOL: "Solana",
      DOT: "Polkadot",
      MATIC: "Polygon",
      LTC: "Litecoin",
      BUSD: "Binance USD",
    };
    return names[type] || type;
  };

  const getCryptoIcon = (type) => {
    const colors = {
      USDT: "bg-green-500/20 text-green-500",
      BTC: "bg-orange-500/20 text-orange-500",
      ETH: "bg-blue-500/20 text-blue-500",
      BNB: "bg-yellow-500/20 text-yellow-500",
      USDC: "bg-blue-400/20 text-blue-400",
      XRP: "bg-gray-500/20 text-gray-400",
      ADA: "bg-blue-600/20 text-blue-600",
      DOGE: "bg-yellow-400/20 text-yellow-400",
      SOL: "bg-purple-500/20 text-purple-500",
      DOT: "bg-pink-500/20 text-pink-500",
      MATIC: "bg-purple-600/20 text-purple-600",
      LTC: "bg-gray-400/20 text-gray-300",
      BUSD: "bg-yellow-500/20 text-yellow-500",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400";
  };

  // Balance includes all deposits converted to USD when approved
  const balance = profile?.balance || 0;
  const demoBalance = profile?.demoBalance || 0;
  const lockedInTrades = profile?.inUseBalance || 0; // Balance locked in active trades
  
  // Total Assets = balance (includes all deposits converted to USD)
  // In Use = balance (USD balance from deposits available for trading)
  // Available = balance - lockedInTrades (what can actually be traded/withdrawn after locked amounts)
  const totalAssets = balance;
  const inUseBalance = balance; // USD balance from deposits available for trading
  const availableBalance = balance - lockedInTrades;
  
  const btcEquivalent = totalAssets / 106000; // Approximate BTC price

  const formatBalance = (value) => {
    if (!isBalanceVisible) return "****";
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-white">
      {/* Header Section */}
      <div className="px-4 pt-4 pb-6">
        {/* Total Assets */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Assets</span>
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isBalanceVisible ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold">
              {formatBalance(totalAssets)}
            </span>
            <span className="text-gray-400 text-sm">USD</span>
          </div>
          
          <div className="text-gray-500 text-sm mb-4">
            ≈ {isBalanceVisible ? btcEquivalent.toFixed(8) : "****"} BTC
          </div>

          {/* Today's P&L */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Today's P&L</span>
            <span className={`text-sm font-medium ${
              walletStats.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {walletStats.todayPnL >= 0 ? '+' : ''}{walletStats.todayPnL.toFixed(2)} USD
              ({walletStats.todayPnLPercent >= 0 ? '+' : ''}{walletStats.todayPnLPercent.toFixed(2)}%)
            </span>
            <FaChevronRight className="text-gray-600 text-xs" />
          </div>
        </div>

        {/* Available Balance & In Use */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-gray-400 text-xs mb-1">Available</div>
            <div className="text-white text-lg font-semibold">
              {formatBalance(availableBalance)} <span className="text-sm font-normal">USD</span>
            </div>
            <div className="text-gray-500 text-[10px] mt-0.5">Can trade & withdraw</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
              In Use
              <FaChevronRight className="text-gray-600 text-xs" />
            </div>
            <div className="text-white text-lg font-semibold">
              {formatBalance(inUseBalance)} <span className="text-sm font-normal">USD</span>
            </div>
            <div className="text-gray-500 text-[10px] mt-0.5">USD balance from deposits</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => navigate("/deposit")}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors">
              <FaArrowDown className="text-white text-xl rotate-45" />
            </div>
            <span className="text-xs text-white">Deposit</span>
          </button>
          
          <button
            onClick={() => navigate("/withdraw")}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
              <FaArrowUp className="text-white text-xl rotate-45" />
            </div>
            <span className="text-xs text-white">Withdraw</span>
          </button>
          
          <button
            onClick={() => navigate("/transfer")}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
              <FaExchangeAlt className="text-white text-xl" />
            </div>
            <span className="text-xs text-white">Transfer</span>
          </button>
          
          <button
            onClick={() => navigate("/convert")}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
              <RiExchangeLine className="text-white text-xl" />
            </div>
            <span className="text-xs text-white">Convert</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab("account")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "account"
              ? "text-white"
              : "text-gray-400"
          }`}
        >
          Account
          {activeTab === "account" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("asset")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "asset"
              ? "text-white"
              : "text-gray-400"
          }`}
        >
          Asset
          {activeTab === "asset" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
          )}
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "account" ? (
        <div className="px-4 py-4">
          {/* Funding Account */}
          <div
            className="flex items-center justify-between py-4 border-b border-gray-800 cursor-pointer hover:bg-gray-900/30 transition-colors"
            onClick={() => navigate("/profile?section=wallet")}
          >
            <div>
              <div className="text-white font-medium mb-1">Funding</div>
              <div className="text-white text-sm">
                {formatBalance(balance)} USD
              </div>
            </div>
            <FaChevronRight className="text-gray-600" />
          </div>

          {/* Unified Trading */}
          <div className="flex items-center justify-between py-4 border-b border-gray-800 cursor-pointer hover:bg-gray-900/30 transition-colors">
            <div>
              <div className="text-white font-medium mb-1">Unified Trading</div>
              <div className="text-white text-sm">
                {formatBalance(inUseBalance)} USD
              </div>
            </div>
            <FaChevronRight className="text-gray-600" />
          </div>

          {/* Invested Products Section */}
          <div className="mt-6">
            <div className="text-gray-400 text-sm mb-4">Invested Products</div>
            
            {/* Earn */}
            <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-900/30 transition-colors">
              <div>
                <div className="text-white font-medium mb-1">Earn</div>
                <div className="text-white text-sm">
                  {formatBalance(balance)} USD
                </div>
              </div>
              <FaChevronRight className="text-gray-600" />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          {/* Asset List Header */}
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800 text-gray-400 text-xs">
            <div>Coin</div>
            <div className="text-right">Amount</div>
            <div className="text-right">PnL (USD)</div>
          </div>

          {/* Asset List */}
          {assets.length > 0 ? (
            assets.map((asset) => (
              <div key={asset.cryptoType} className="grid grid-cols-3 gap-4 py-4 border-b border-gray-800 items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${getCryptoIcon(asset.cryptoType)} flex items-center justify-center font-bold text-xs`}>
                      {asset.cryptoType.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{asset.cryptoType}</div>
                      <div className="text-gray-500 text-xs">{asset.cryptoName}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {isBalanceVisible ? (
                    <>
                      <div className="text-white text-sm font-medium">{formatBalance(asset.totalUSD)}</div>
                      <div className="text-gray-500 text-xs">USD</div>
                    </>
                  ) : (
                    <>
                      <div className="text-white text-sm font-medium">******</div>
                      <div className="text-gray-500 text-xs">******</div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  {isBalanceVisible ? (
                    <>
                      <div className={`text-sm ${asset.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.pnl >= 0 ? '+' : ''}{formatBalance(asset.pnl)}
                      </div>
                      <div className={`text-xs ${asset.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.pnlPercent >= 0 ? '+' : ''}{asset.pnlPercent.toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 text-sm">******</div>
                      <div className="text-gray-500 text-xs">******</div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No assets found. Deposit cryptocurrencies to see them here.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalProfileNew;

