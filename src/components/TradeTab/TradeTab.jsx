import React, { useState } from 'react';
import TradingPage from '../../pages/TradingPage/TradingPage';
import Navbar from '../Navbar/Navbar';
import { ForexTrading } from '../../pages/ForexTrading/ForexTrading';
import GoldTradingPage from '../GoldTrading/GoldTrading';
import { FaCoins, FaChartLine, FaGem } from 'react-icons/fa';

const TradeTab = () => {
  const tabs = [
    { name: 'Crypto', icon: FaCoins },
    { name: 'Forex', icon: FaChartLine },
    { name: 'Gold', icon: FaGem }
  ];
  const [activeTab, setActiveTab] = useState('Crypto');

  const renderContent = () => {
    switch (activeTab) {
      case 'Crypto':
        return <TradingPage/>;
      case 'Forex':
        return <ForexTrading/>;
      case 'Gold':
        return <GoldTradingPage/>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200">
      <Navbar/>
      <div className="sticky top-0 z-[100] bg-[rgba(26,29,41,0.6)] backdrop-blur-xl border-b border-[#2a2d3a]">
        <div className="max-w-7xl mx-auto px-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent max-w-[1400px] mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  className={`group relative flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all duration-300 whitespace-nowrap text-[13px] sm:text-sm ${
                    isActive
                      ? 'text-teal-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <Icon className={`text-base sm:text-lg transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span>{tab.name}</span>
                  {isActive && (
                    <>
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></span>
                      <span className="absolute inset-0 bg-teal-500/5 rounded-t-lg"></span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default TradeTab;
