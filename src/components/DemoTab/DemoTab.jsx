import React, { useState } from 'react';
import Demo from '../Demo/Demo';
import Navbar from '../Navbar/Navbar';
import { ForexTrading } from '../../pages/ForexTrading/ForexTrading';
import GoldTradingPage from '../GoldTrading/GoldTrading';
import { FaCoins, FaChartLine, FaGem } from 'react-icons/fa';

const DemoTab = () => {
  const tabs = [
    { name: 'Crypto', icon: FaCoins },
    { name: 'Forex', icon: FaChartLine },
    { name: 'Gold', icon: FaGem }
  ];
  const [activeTab, setActiveTab] = useState('Crypto');

  const renderContent = () => {
    switch (activeTab) {
      case 'Crypto':
        return <Demo/>;
      case 'Forex':
        return <ForexTrading isDemo={true} />;
      case 'Gold':
        return <GoldTradingPage isDemo={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200">
      <Navbar/>
      
      {/* Modern Tab Navigation */}
      <div className="sticky top-0 z-30 bg-[rgba(11,14,20,0.8)] backdrop-blur-xl border-b border-[#2a2d3a]">
        <div className="max-w-7xl mx-auto px-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`group relative flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'text-teal-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`text-lg transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-sm md:text-base">{tab.name}</span>
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

      {/* Content */}
      <div className="pb-20">
        {renderContent()}
      </div>
    </div>
  );
};

export default DemoTab;
