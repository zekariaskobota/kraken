import React, { useState, useEffect } from "react";
import { FaCopy, FaShareAlt, FaUsers, FaDollarSign, FaGift } from "react-icons/fa";
import { authAPI } from "../../services/apiService";
import Swal from "sweetalert2";

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
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "Referral code copied to clipboard",
      timer: 1500,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e5e7eb",
    });
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
      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Referral link copied to clipboard",
        timer: 1500,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e5e7eb",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6">
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
    <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaGift className="text-teal-400 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Referral Program</h3>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="text-xs text-gray-400 mb-2 block">Your Referral Code</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg px-4 py-3">
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
            className="px-4 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
          >
            <FaShareAlt />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[rgba(11,14,20,0.6)] rounded-lg p-3 border border-[#2a2d3a]">
          <div className="flex items-center gap-2 mb-1">
            <FaUsers className="text-blue-400 text-sm" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-white">{stats.totalReferrals}</div>
        </div>
        <div className="bg-[rgba(11,14,20,0.6)] rounded-lg p-3 border border-[#2a2d3a]">
          <div className="flex items-center gap-2 mb-1">
            <FaUsers className="text-green-400 text-sm" />
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-white">{stats.activeReferrals}</div>
        </div>
        <div className="bg-[rgba(11,14,20,0.6)] rounded-lg p-3 border border-[#2a2d3a]">
          <div className="flex items-center gap-2 mb-1">
            <FaDollarSign className="text-yellow-400 text-sm" />
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

