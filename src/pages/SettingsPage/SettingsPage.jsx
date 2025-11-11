import React, { useState, useEffect } from "react";
import {
  FaShieldAlt,
  FaHistory,
  FaKey,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import Identity from "../../components/IdentityVerification/Identity";
import TabComponent from "../../components/HistoryTab/TabComponent";
import ChangePassword from "../../components/ChangePassword/changePassword";
import PortfolioPerformance from "../../components/PortfolioPerformance/PortfolioPerformance";
import QuickStats from "../../components/QuickStats/QuickStats";
import RecentActivity from "../../components/RecentActivity/RecentActivity";
import MarketOverview from "../../components/MarketOverview/MarketOverview";
import SecurityStatus from "../../components/SecurityStatus/SecurityStatus";
import ReferralProgram from "../../components/ReferralProgram/ReferralProgram";
import AssetAllocation from "../../components/AssetAllocation/AssetAllocation";
import QuickActions from "../../components/QuickActions/QuickActions";
import NotificationsCenter from "../../components/NotificationsCenter/NotificationsCenter";
import Achievements from "../../components/Achievements/Achievements";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section && ["dashboard", "identity", "history", "security"].includes(section)) {
      setActiveSection(section);
    }
  }, [location]);

  const menuSections = [
    {
      id: "dashboard",
      icon: <FaChartLine />,
      label: "Dashboard",
      component: (
        <div className="space-y-4 sm:space-y-6">
          <QuickStats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <PortfolioPerformance />
            <SecurityStatus />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RecentActivity />
            <MarketOverview />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <AssetAllocation />
            <QuickActions />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ReferralProgram />
            <NotificationsCenter />
          </div>
          <Achievements />
        </div>
      ),
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "identity",
      icon: <FaShieldAlt />,
      label: "Identity Verification",
      component: <Identity />,
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "history",
      icon: <FaHistory />,
      label: "Trading History",
      component: <TabComponent />,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "security",
      icon: <FaKey />,
      label: "Security",
      component: <ChangePassword />,
      color: "from-orange-500 to-red-500",
    },
  ];

  const renderContent = () => {
    const section = menuSections.find((s) => s.id === activeSection);
    return section ? section.component : menuSections[0].component;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
      <Navbar />

      <div className="w-full px-0 sm:px-2 lg:px-4 py-2 sm:py-4 lg:py-6">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold sm:font-extrabold text-white mb-1">
            Settings
          </h1>
          <p className="text-slate-400 text-xs">
            Manage your account settings, security, and preferences
          </p>
        </div>

        {/* Navigation Tabs - Modern Horizontal Tabs */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 sm:p-1.5 sm:p-2 overflow-x-auto">
            <div className="flex gap-1 sm:gap-1.5 sm:gap-2 w-full">
              {menuSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center justify-center gap-1 sm:gap-1.5 sm:gap-2 px-2 sm:px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-normal sm:font-medium text-xs transition-all duration-300 whitespace-nowrap flex-1 sm:flex-initial ${
                    activeSection === section.id
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105 font-medium`
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-xs sm:text-sm sm:text-base">{section.icon}</span>
                  <span className="hidden sm:inline">{section.label}</span>
                  <span className="sm:hidden text-xs">{section.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-2 sm:p-3 sm:p-4 lg:p-5 shadow-2xl min-h-[600px] mx-2 sm:mx-4">
          <div className="transition-all duration-300 ease-in-out">
            {renderContent()}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;

