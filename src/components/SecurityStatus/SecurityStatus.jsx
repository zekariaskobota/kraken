import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaCheckCircle, FaTimesCircle, FaLock, FaClock } from "react-icons/fa";
import { authAPI, identityAPI } from "../../services/apiService";

const SecurityStatus = () => {
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastLogin: null,
    securityScore: 0,
    emailVerified: true,
    identityVerified: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      const [data, identityData] = await Promise.all([
        authAPI.getProfile(),
        identityAPI.getStatus(),
      ]);

      let securityScore = 0;
      if (data.email) securityScore += 25;
      if (data.password) securityScore += 25;
      const identityStatus = identityData?.identity?.status || identityData?.status || "";
      if (identityStatus === "Verified") {
        securityScore += 25;
      }
      // 2FA would add 25 more if implemented

      setSecurity({
        twoFactorEnabled: false, // Implement 2FA later
        lastLogin: data.lastLogin || new Date(),
        securityScore,
        emailVerified: !!data.email,
        identityVerified: identityStatus === "Verified",
      });
    } catch (error) {
      console.error("Error fetching security status:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-20 bg-slate-700/50 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const securityItems = [
    {
      label: "Email Verified",
      status: security.emailVerified,
      icon: <FaCheckCircle />,
    },
    {
      label: "Identity Verified",
      status: security.identityVerified,
      icon: <FaShieldAlt />,
    },
    {
      label: "2FA Enabled",
      status: security.twoFactorEnabled,
      icon: <FaLock />,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[rgba(26,29,41,0.8)] to-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaShieldAlt className="text-teal-400 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Security Status</h3>
      </div>

      {/* Security Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Security Score</span>
          <span className={`text-lg font-bold ${getScoreColor(security.securityScore)}`}>
            {security.securityScore}%
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              security.securityScore >= 75
                ? "bg-gradient-to-r from-green-400 to-emerald-400"
                : security.securityScore >= 50
                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                : "bg-gradient-to-r from-red-400 to-pink-400"
            }`}
            style={{ width: `${security.securityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Security Items */}
      <div className="space-y-2 mb-4">
        {securityItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]"
          >
            <div className="flex items-center gap-2">
              <span className={item.status ? "text-green-400" : "text-gray-500"}>{item.icon}</span>
              <span className="text-xs sm:text-sm text-gray-300">{item.label}</span>
            </div>
            {item.status ? (
              <FaCheckCircle className="text-green-400 text-sm" />
            ) : (
              <FaTimesCircle className="text-gray-500 text-sm" />
            )}
          </div>
        ))}
      </div>

      {/* Last Login */}
      <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-[#2a2d3a]">
        <FaClock className="text-xs" />
        <span>Last login: {formatDate(security.lastLogin)}</span>
      </div>
    </div>
  );
};

export default SecurityStatus;

