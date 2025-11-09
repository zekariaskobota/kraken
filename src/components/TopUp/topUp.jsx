import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import BottomNavigation from "../BottomNavigation/BottomNavigation";
import { FaCopy } from "react-icons/fa"; 
import config from "../../config";
import Swal from 'sweetalert2';


const TopUpRewards = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showRechargePopup, setShowRechargePopup] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [rewardMessage, setRewardMessage] = useState("");
  const [totalRewards, setTotalRewards] = useState(0);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [cryptoRates, setCryptoRates] = useState({});
  const [address, setAddress] = useState("");
  const [addresses, setAddresses] = useState([]);

  const levels = [
  { level: "LV0", minBalance: 0, reward: "No rewards, entry level." },
  { level: "LV1", minBalance: 500, reward: "5% cashback on deposits." },
  { level: "LV2", minBalance: 2000, reward: "7% cashback on deposits." },
  { level: "LV3", minBalance: 3500, reward: "10% cashback on deposits." },
  { level: "LV4", minBalance: 5000, reward: "12% cashback + priority support." },
  { level: "LV5", minBalance: 10000, reward: "15% cashback + VIP support." },
  { level: "LV6", minBalance: 15000, reward: "25% cashback + exclusive bonuses." }
];
  const fetchAddresses = async () => {
    try {
      const response = await fetch(
        `${config.BACKEND_URL}/api/admin/alladdresses`
      );
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      // Error handling without console.log
    }
  };


  const fetchCryptoRates = async () => {
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/price");
      const data = await response.json();

      const rates = {};
      data.forEach((item) => {
        const symbol = item.symbol;
        const price = parseFloat(item.price);
        if (symbol === "BTCUSDT") rates.BTC = price;
        if (symbol === "ETHUSDT") rates.ETH = price;
        if (symbol === "BNBUSDT") rates.BNB = price;
        if (symbol === "USDTUSDT") rates.USDT = price; 
      });

      setCryptoRates(rates);
    } catch (error) {
      // Error handling without console.log
    }
  };
  useEffect(() => {
    fetchUserData();
    fetchTotalRewards();
    fetchCryptoRates();
    fetchAddresses();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${config.BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      setUser(userData);
      setBalance(userData.balance);
    } catch (error) {
      // Error handling without console.log
    }
  };

  const fetchTotalRewards = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${config.BACKEND_URL}/api/rewards/total-rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTotalRewards(Number(response.data.totalRewards) || 0);
    } catch (error) {
      // Error handling without console.log
    }
  };

  const getCurrentLevel = (balance) => {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (balance >= levels[i].minBalance) return levels[i];
    }
    return levels[0];
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || isNaN(rechargeAmount) || !proofFile) return;
  
    const parsedAmount = parseFloat(rechargeAmount);
    let equivalentInUSDT = parsedAmount;
    if (selectedCrypto !== "USDT") {
      const rate = cryptoRates[selectedCrypto] || 1;
      equivalentInUSDT = parsedAmount * rate;
    }
  
    const formData = new FormData();
    formData.append("amount", parsedAmount);
    formData.append("equivalentInUSDT", equivalentInUSDT);
    formData.append("cryptoType", selectedCrypto);
    formData.append("walletAddress", addresses[selectedCrypto]);
    formData.append("proofFile", proofFile);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const response = await axios.post(`${config.BACKEND_URL}/api/rewards/recharge`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
  
      setRechargeAmount("");
      setProofFile(null);
      setShowRechargePopup(false);
      setRewardMessage(`Recharge successful! You earned ${response.data.rewardAmount} USDT as a reward.`);
      fetchUserData();
    } catch (error) {
      // Error handling without console.log
    }
  };
  
  
  const handleCryptoChange = (event) => {
    const selected = event.target.value;
    setSelectedCrypto(selected);
    const selectedAddress =
      addresses.find((addr) => addr.cryptoType === selected)?.address || "";
    setAddress(selectedAddress);
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    Swal.fire({
      icon: 'success',
      title: 'Copied to Clipboard!',
      text: `${selectedCrypto} address has been copied to your clipboard.`,
      confirmButtonColor: '#22c55e',
    });
  };

  const userLevel = getCurrentLevel(balance);
  const nextLevel = levels.find((lvl) => lvl.minBalance > userLevel.minBalance);

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col" style={{ width: "100vw" }}>
      <Navbar />

      <div className="bg-blue-500 p-4 rounded-lg text-center">
        <div className="text-sm font-bold">{userLevel.level}</div>
        <div className="text-lg font-semibold">Current cumulative total amount</div>
        <div className="text-3xl font-bold">{balance.toFixed(2)} <span className="text-sm">USDT</span></div>

        <div className="bg-gray-800 p-4 rounded-lg mt-6 text-center">
          <div className="text-sm">Total Rewards Earned</div>
          <div className="text-2xl font-bold text-yellow-300">
            {totalRewards ? totalRewards.toFixed(2) : 0} USDT
          </div>
        </div>

        <div className="text-sm mt-2">{userLevel.reward}</div>
        <div className="w-full h-1 bg-gray-300 mt-2"></div>
      </div>

      <div className="flex justify-between mt-6 text-gray-400 text-sm border-b border-gray-600 pb-2 ml-2 mr-2">
        {levels.map(({ level }) => (
          <span key={level} className={userLevel.level === level ? "text-yellow-400 font-bold" : ""}>
            {level}
          </span>
        ))}
      </div>

      {nextLevel && (
        <div className="bg-gray-700 p-4 rounded-lg mt-6 text-center">
          <div className="text-sm">
            Next level ({nextLevel.level}) requires{" "}
            <span className="text-green-400 font-bold">{nextLevel.minBalance} USDT</span>
          </div>
        </div>
      )}

      <button
        className="w-full bg-green-500 text-white py-3 rounded-lg mt-6 font-semibold recharge-btn"
        onClick={() => setShowRechargePopup(true)}
        style={{ background: "green" }}
      >
        Recharge Upgrade
      </button>

      {rewardMessage && (
        <div className="bg-green-500 text-white p-4 mt-4 rounded-lg text-center">{rewardMessage}</div>
      )}

      <BottomNavigation />

      {/* Recharge Popup */}
      {showRechargePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg w-90">
            <h3 className="text-lg font-semibold text-green-400">Recharge</h3>

            <label className="block text-white mt-2 mb-1">Select Crypto</label>
             <select
              value={selectedCrypto}
              onChange={handleCryptoChange}
              className="mb-4 p-2 w-full bg-gray-700 rounded-md"
            >
              <option value="">Select</option>
              {addresses.map((addr) => (
                <option key={addr.cryptoType} value={addr.cryptoType}>
                  {addr.cryptoName}
                </option>
              ))}
            </select>

            <p className="text-white mb-2">Send {selectedCrypto} to the following address:</p>
            <div className="flex items-center justify-between bg-gray-700 p-2 rounded text-white gap-4">
              <span className="break-all">{address}</span>
              <button onClick={copyToClipboard} className="text-white">
                <FaCopy />
              </button>
            </div>

            <input
              type="number"
              className="w-full p-2 mt-4 rounded bg-gray-700 text-white"
              placeholder="Enter amount"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
            />

            <input
              type="file"
              className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
              accept="image/*,application/pdf"
              onChange={(e) => setProofFile(e.target.files[0])}
            />

            <button
              className="w-full bg-blue-500 text-white py-2 mt-4 rounded-lg"
              onClick={handleRecharge}
            >
              Confirm
            </button>
            <button
              className="w-full bg-red-500 text-white py-2 mt-2 rounded-lg"
              onClick={() => setShowRechargePopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUpRewards;