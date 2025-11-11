import React, { useState, useEffect } from "react";
import { FaCopy, FaShareAlt, FaUsers, FaDollarSign, FaGift } from "react-icons/fa";
import { authAPI } from "../../services/apiService";
import { showToast } from "../../utils/toast";

const ReferralProgram = () => {
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const data = await authAPI.getProfile();

      // Generate referral code from user ID
      const code = data.userId || (data._id ? data._id.substring(0, 8).toUpperCase() : "REF" + Math.random().toString(36).substring(2, 8).toUpperCase());
      setReferralCode(code);

      // Set real stats (0 since there's no referral API yet)
      // These will be populated when referral system is implemented
      setStats({
        totalReferrals: 0,
        activeReferrals: 0,
        totalEarnings: 0,
      });
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    showToast.success("Referral code copied to clipboard");
  };

  const shareReferral = () => {
    const shareText = `Join me on this amazing trading platform! Use my referral code: ${referralCode}`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      navigator.share({
        title: "Join the Trading Platform",
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      showToast.success("Referral link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-16 bg-slate-700/50 rounded"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaGift className="text-teal-400 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Referral Program</h3>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="text-xs text-gray-400 mb-2 block">Your Referral Code</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3">
            <span className="text-lg sm:text-xl font-bold text-teal-400 font-mono">{referralCode}</span>
          </div>
          <button
            onClick={copyReferralCode}
            className="px-4 py-3 bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-all duration-300"
          >
            <FaCopy />
          </button>
          <button
            onClick={shareReferral}
            className="px-4 py-3 bg-gray-700/50 border border-gray-600 text-teal-400 rounded-lg hover:bg-gray-700/70 transition-all duration-300"
          >
            <FaShareAlt />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <FaUsers className="text-teal-400 text-sm" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-white">{stats.totalReferrals}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <FaUsers className="text-teal-400 text-sm" />
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-white">{stats.activeReferrals}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <FaDollarSign className="text-teal-400 text-sm" />
            <span className="text-xs text-gray-400">Earnings</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-white">
            ${stats.totalEarnings.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;

