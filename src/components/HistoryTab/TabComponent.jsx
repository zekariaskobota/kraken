import React, { useState } from "react";
import { FaHistory, FaArrowDown, FaArrowUp, FaExchangeAlt, FaWallet } from "react-icons/fa";
import DepositHistory from "../DepositHistory/DepositHistory";
import WithdrawalHistory from "../WithdrawalHistory/WithdrawalHistory";
import BuySellHistory from "../BuySellHistory/BuySellHistory";
import TradeHistory from "../TradeHistory/TradeHistory";

const TabComponent = () => {
  const tabs = [
    { name: "Withdrawals", icon: FaArrowUp, color: "from-orange-500 to-red-600" },
    { name: "Trades", icon: FaExchangeAlt, color: "from-blue-500 to-cyan-600" },
    { name: "Deposits", icon: FaArrowDown, color: "from-teal-500 to-emerald-600" },
    { name: "Buy", icon: FaArrowUp, color: "from-green-500 to-teal-600" },
    { name: "Sell", icon: FaArrowDown, color: "from-red-500 to-pink-600" },
  ];
  const [activeTab, setActiveTab] = useState("Withdrawals");

  const renderContent = () => {
    switch (activeTab) {
      case "Withdrawals":
        return <WithdrawalHistory />;
      case "Deposits":
        return <DepositHistory />;
      case "Trades":
        return <TradeHistory />;
      case "Buy":
        return <BuySellHistory tradeType="Buy" />;
      case "Sell":
        return <BuySellHistory tradeType="Sell" />;
      default:
        return null;
    }
  };

  const getActiveTab = () => tabs.find(tab => tab.name === activeTab);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Section */}
      <div className="relative bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl px-6 py-4 overflow-hidden">
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20">
            <FaHistory className="text-lg text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Spot History
            </h2>
            <p className="text-xs text-gray-400 m-0">
              View and manage your transaction history
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-1 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-500/50 scrollbar-track-transparent">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`group relative flex items-center justify-center gap-1.5 flex-shrink-0 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md scale-[1.02]`
                    : "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-[rgba(38,166,154,0.08)]"
                }`}
              >
                <Icon className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {tab.name}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-4 md:p-3 min-h-[400px] overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default TabComponent;
