import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaBitcoin, FaChartLine, FaShieldAlt, FaExchangeAlt, FaUsers, FaMobileAlt, FaEthereum, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo/Logo";

const features = [
  { icon: <FaBitcoin size={32} />, title: "Real-Time Trading", desc: "Execute trades instantly with our high-speed trading engine." },
  { icon: <FaChartLine size={32} />, title: "Advanced Analytics", desc: "Make informed decisions with our AI-powered market insights." },
  { icon: <FaShieldAlt size={32} />, title: "Secure Transactions", desc: "Your funds are protected with top-tier encryption and security." },
  { icon: <FaExchangeAlt size={32} />, title: "Low Transaction Fees", desc: "Enjoy some of the lowest fees in the industry." },
  { icon: <FaUsers size={32} />, title: "Community Support", desc: "Engage with our active trading community for insights and help." },
  { icon: <FaMobileAlt size={32} />, title: "Mobile Trading", desc: "Trade on the go with our fully responsive website in mobile phones." },
];

const LandingPage = () => {
  const bnb = "bnb.png";
  const [cryptoPrices, setCryptoPrices] = useState({
    BTC: null,
    ETH: null,
    BNB: null,
    SOL: null,
    ADA: null,
    XRP: null,
  });

  const [priceChanges, setPriceChanges] = useState({
    BTC: null,
    ETH: null,
    BNB: null,
    SOL: null,
    ADA: null,
    XRP: null,
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT'];
        const response = await Promise.all(
          symbols.map(symbol => fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`))
        );
        
        const data = await Promise.all(response.map(res => res.json()));

        setCryptoPrices({
          BTC: parseFloat(data[0].price).toFixed(2),
          ETH: parseFloat(data[1].price).toFixed(2),
          BNB: parseFloat(data[2].price).toFixed(2),
          SOL: parseFloat(data[3].price).toFixed(2),
          ADA: parseFloat(data[4].price).toFixed(2),
          XRP: parseFloat(data[5].price).toFixed(2),
        });

        const changes = await Promise.all(
          symbols.map(symbol => fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`))
        );
        
        const changeData = await Promise.all(changes.map(res => res.json()));
        setPriceChanges({
          BTC: parseFloat(changeData[0].priceChangePercent).toFixed(2),
          ETH: parseFloat(changeData[1].priceChangePercent).toFixed(2),
          BNB: parseFloat(changeData[2].priceChangePercent).toFixed(2),
          SOL: parseFloat(changeData[3].priceChangePercent).toFixed(2),
          ADA: parseFloat(changeData[4].priceChangePercent).toFixed(2),
          XRP: parseFloat(changeData[5].priceChangePercent).toFixed(2),
        });
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200">
      {/* Modern Navbar */}
      <nav className="w-full bg-gradient-to-r from-[#0b0e14] to-[#1a1d29] border-b border-[rgba(42,45,58,0.5)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <Logo size="default" showText={true} />
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-teal-500/10 transition-all duration-300">Login</button>
            </Link>
            <Link to="/register">
              <button className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              Trade Crypto with
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent"> Confidence</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Professional trading platform with advanced charts, real-time data, and lightning-fast execution.
              Join thousands of traders worldwide.
            </p>
            <div className="flex flex-row gap-3 sm:gap-4 justify-center flex-wrap">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 flex items-center gap-2"
                >
                  Start Trading <FaArrowRight />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-lg text-base font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Live Prices Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-6 md:p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-white">Live Market Prices</h3>
              <span className="flex items-center gap-2 text-sm text-teal-400 font-medium">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.keys(cryptoPrices).map((crypto, index) => (
                <motion.div
                  key={crypto}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-4 hover:border-teal-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {crypto === "BTC" && <FaBitcoin size={20} className="text-yellow-400" />}
                    {crypto === "ETH" && <FaEthereum size={20} className="text-blue-400" />}
                    {crypto === "BNB" && <img src={bnb} alt="BNB" className="w-5 h-5" />}
                    {crypto === "SOL" && <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">SOL</div>}
                    {crypto === "ADA" && <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">ADA</div>}
                    {crypto === "XRP" && <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">XRP</div>}
                    <span className="text-sm font-semibold text-gray-300">{crypto}</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white mb-1">${cryptoPrices[crypto] || '0.00'}</div>
                    <div className={`text-sm font-semibold ${priceChanges[crypto] >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                      {priceChanges[crypto] >= 0 ? '+' : ''}{priceChanges[crypto] || '0.00'}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Why Choose KRAKEN?</h2>
            <p className="text-lg md:text-xl text-gray-400">Everything you need for professional crypto trading</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-teal-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Ready to Start Trading?</h2>
            <p className="text-lg md:text-xl text-gray-400 mb-8">Join thousands of traders and start your crypto journey today</p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40"
              >
                Create Free Account
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border-t border-[rgba(42,45,58,0.5)] py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Logo size="default" showText={true} />
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/privacy-policy" className="text-gray-400 hover:text-teal-400 transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="text-gray-400 hover:text-teal-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Contact Us</a>
          </div>
          <div className="text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Kraken. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
