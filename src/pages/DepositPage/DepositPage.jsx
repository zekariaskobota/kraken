import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCopy, FaCheck, FaWallet, FaInfoCircle, FaExclamationTriangle, FaUpload } from "react-icons/fa";
import { depositsAPI, adminAPI } from "../../services/apiService";
import showToast from "../../utils/toast";
import config from "../../config";
import Navbar from "../../components/Navbar/Navbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

const DepositPage = () => {
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositProof, setDepositProof] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cryptoOptions, setCryptoOptions] = useState([]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await adminAPI.getAllAddresses();
      
      // Handle different response formats
      let addressData = [];
      if (Array.isArray(response)) {
        addressData = response;
      } else if (response && response.addresses) {
        addressData = response.addresses;
      } else if (response && typeof response === 'object') {
        addressData = Object.values(response);
      }
      
      setAddresses(addressData);
      
      // Extract unique crypto types and their networks from addresses
      const cryptoMap = {};
      addressData.forEach((addr) => {
        if (addr.cryptoType && addr.network) {
          if (!cryptoMap[addr.cryptoType]) {
            cryptoMap[addr.cryptoType] = {
              symbol: addr.cryptoType,
              name: addr.cryptoName || addr.cryptoType,
              networks: []
            };
          }
          if (!cryptoMap[addr.cryptoType].networks.includes(addr.network)) {
            cryptoMap[addr.cryptoType].networks.push(addr.network);
          }
        }
      });
      
      const options = Object.values(cryptoMap);
      setCryptoOptions(options);
      
      // Set initial selections if available
      if (options.length > 0) {
        const firstCrypto = options[0];
        setSelectedCrypto(firstCrypto.symbol);
        if (firstCrypto.networks.length > 0) {
          setSelectedNetwork(firstCrypto.networks[0]);
          
          // Set initial address
          const initialAddr = addressData?.find(
            addr => addr.cryptoType === firstCrypto.symbol && addr.network === firstCrypto.networks[0]
          );
          setAddress(initialAddr?.address || "");
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  useEffect(() => {
    const addr = addresses.find(
      addr => addr.cryptoType === selectedCrypto && addr.network === selectedNetwork
    );
    setAddress(addr?.address || "");
  }, [selectedCrypto, selectedNetwork, addresses]);

  const handleCryptoChange = (crypto) => {
    setSelectedCrypto(crypto);
    const cryptoData = cryptoOptions.find(c => c.symbol === crypto);
    if (cryptoData?.networks?.length > 0) {
      setSelectedNetwork(cryptoData.networks[0]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    showToast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("File size must be less than 5MB");
        return;
      }
      setDepositProof(file);
    }
  };

  const handleSubmit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      showToast.error("Please enter a valid amount");
      return;
    }

    if (!depositProof) {
      showToast.error("Please upload payment proof");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("amount", depositAmount);
      formData.append("cryptoType", selectedCrypto);
      formData.append("cryptoAddress", address);
      formData.append("network", selectedNetwork);
      formData.append("proofOfDeposit", depositProof);

      await depositsAPI.createDeposit(formData);
      
      showToast.success("Deposit request submitted successfully!");
      
      // Reset form
      setDepositAmount("");
      setDepositProof(null);
      
      // Navigate back after short delay
      setTimeout(() => navigate("/profile"), 1500);
    } catch (error) {
      showToast.error(error.response?.data?.error || "Failed to submit deposit request");
    } finally {
      setLoading(false);
    }
  };

  const selectedCryptoData = cryptoOptions.find(c => c.symbol === selectedCrypto);
  const getNetworkName = (network) => {
    const names = {
      "TRC20": "TRON (TRC-20)",
      "ERC20": "Ethereum (ERC-20)",
      "BEP20": "BSC (BEP-20)",
      "Bitcoin": "Bitcoin Network"
    };
    return names[network] || network;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20 pt-16 md:pt-20">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
              >
                <FaArrowLeft className="text-sm" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Deposit Crypto</h1>
                <p className="text-xs md:text-sm text-gray-400">Deposit digital assets to your account</p>
              </div>
            </div>
          </div>

          {cryptoOptions.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-12 text-center">
              <FaWallet className="text-5xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Deposit Temporarily Unavailable</h3>
              <p className="text-sm text-gray-400 mb-4">Please check back soon or contact support.</p>
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-all"
              >
                Back to Assets
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Coin Selection */}
              <div className="bg-gray-800/50 rounded-xl p-4 md:p-5">
                <label className="text-xs text-gray-400 mb-2 block">Select Coin</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {cryptoOptions.map((crypto) => (
                    <button
                      key={crypto.symbol}
                      onClick={() => handleCryptoChange(crypto.symbol)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedCrypto === crypto.symbol
                          ? "bg-teal-500 text-white"
                          : "bg-gray-900/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
                      }`}
                    >
                      {crypto.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Selection */}
              <div className="bg-gray-800/50 rounded-xl p-4 md:p-5">
                <label className="text-xs text-gray-400 mb-3 block">Deposit Network</label>
                <div className="space-y-2">
                  {selectedCryptoData?.networks.map((network) => (
                    <button
                      key={network}
                      onClick={() => setSelectedNetwork(network)}
                      className={`w-full p-3 md:p-4 rounded-lg text-left transition-all ${
                        selectedNetwork === network
                          ? "bg-teal-500/20 border border-teal-500"
                          : "bg-gray-900/50 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{network}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{getNetworkName(network)}</div>
                        </div>
                        {selectedNetwork === network && (
                          <FaCheck className="text-teal-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Address & QR Code */}
              {address ? (
                <div className="bg-gray-800/50 rounded-xl p-4 md:p-5">
                  <label className="text-xs text-gray-400 mb-3 block">Deposit Address</label>
                  
                  {/* QR Code */}
                  <div className="bg-white p-3 rounded-lg mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">QR Code</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-400 mb-2">{selectedCrypto} Address</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-xs md:text-sm text-white break-all font-mono">{address}</div>
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition-all flex-shrink-0"
                      >
                        {copied ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                      </button>
                    </div>
                  </div>

                  {/* Network Info */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-gray-300">
                    <div className="flex items-start gap-2">
                      <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div>• Send only <span className="text-white font-semibold">{selectedCrypto}</span> to this address</div>
                        <div>• Network: <span className="text-white font-semibold">{selectedNetwork}</span></div>
                        <div>• Minimum deposit: <span className="text-white font-semibold">10 USD</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                  <FaExclamationTriangle className="text-red-400 text-2xl mx-auto mb-2" />
                  <p className="text-sm text-gray-300">
                    No address configured for {selectedCrypto} ({selectedNetwork})
                  </p>
                </div>
              )}

              {/* Deposit Form */}
              <div className="bg-gray-800/50 rounded-xl p-4 md:p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Confirm Your Deposit</h3>
                
                {/* Amount */}
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-2 block">Amount ({selectedCrypto || 'Crypto'})</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={`Enter deposit amount in ${selectedCrypto || 'crypto'}`}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                {/* Upload Proof */}
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-2 block">Upload Payment Proof</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="deposit-proof"
                  />
                  <label
                    htmlFor="deposit-proof"
                    className={`block w-full p-4 rounded-lg text-center cursor-pointer transition-all ${
                      depositProof
                        ? "bg-teal-500/20 border border-teal-500"
                        : "bg-gray-900/50 border border-dashed border-gray-700 hover:border-teal-500"
                    }`}
                  >
                    {depositProof ? (
                      <div className="flex items-center justify-center gap-2 text-teal-400">
                        <FaCheck />
                        <span className="text-sm">{depositProof.name}</span>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <FaUpload className="mx-auto text-xl mb-2" />
                        <span className="text-xs">Click to upload transaction screenshot</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !address}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Deposit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
    </>
  );
};

export default DepositPage;
