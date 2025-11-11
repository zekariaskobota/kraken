import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import PersonalProfileNew from "../../components/Wallet/PersonalProfileNew";

const ProfilePage = () => {

  return (
    <>
      {/* Desktop: Show Navbar and wrapped layout */}
      <div className="hidden md:block">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
          <div className="w-full px-0 sm:px-2 lg:px-4 py-2 sm:py-4 lg:py-6">
            {/* Header Section */}
            <div className="mb-4 sm:mb-6 px-2 sm:px-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold sm:font-extrabold text-white mb-1">
                Assets
              </h1>
              <p className="text-slate-400 text-xs">
                Manage your wallet, deposits, and withdrawals
              </p>
            </div>

            {/* Main Content Area */}
            <div className="mx-2 sm:mx-4">
              <PersonalProfileNew />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Full screen Bybit-style */}
      <div className="md:hidden bg-gradient-to-br from-[#0b0e14] to-[#1a1d29]">
        <PersonalProfileNew />
      </div>

      <BottomNavigation />
    </>
  );
};

export default ProfilePage;
