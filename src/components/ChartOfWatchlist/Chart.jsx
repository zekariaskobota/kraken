import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Line,
  Brush,
} from "recharts";
import { useLocation } from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import TradePopup from "../TradePopup/TradePopup";
import BottomNavigation from "../BottomNavigation/BottomNavigation";

const CRYPTO_OPTIONS = ["BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "ADA", "AVAX"];

const Chart = () => {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [cryptoData, setCryptoData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTradePopupOpen, setTradePopupOpen] = useState(false);
  const [tradeType, setTradeType] = useState("Buy"); // Default to Buy

  const location = useLocation();
  const coin = location.state?.cryptoData;

  if (!coin) return <p>No data available. Try selecting a coin again.</p>;

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 5000); // Auto-refresh every 5 seconds
    setSelectedCrypto(coin.symbol);
    return () => clearInterval(interval);
  }, [selectedCrypto]);

  const fetchCryptoData = async () => {
    try {
      const symbol = selectedCrypto.toUpperCase() + "USDT";

      const marketResponse = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
      );
      const chartResponse = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=100`
      );

      if (!marketResponse.data || !chartResponse.data)
        throw new Error("Invalid crypto ID or data unavailable");

      setCryptoData({
        name: selectedCrypto.toUpperCase(),
        symbol: selectedCrypto,
        current_price: parseFloat(marketResponse.data.lastPrice),
        price_change_percentage_24h: parseFloat(
          marketResponse.data.priceChangePercent
        ),
        high: parseFloat(marketResponse.data.highPrice),
        low: parseFloat(marketResponse.data.lowPrice),
      });

      setChartData(
        chartResponse.data.map(([timestamp, open, high, low, close]) => ({
          time: new Date(timestamp).toLocaleTimeString(),
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (!cryptoData)
    return (
      <div className="text-red-400 text-center p-5">Failed to load data</div>
    );

    const handleTrade = (action) => {
      if (selectedCrypto) {
        setTradeType(action);
        setTradePopupOpen(true);
      }
    };

  return (
    <div className="bg-gray-900 text-white min-h-screen w-screen pb-22">
      <Navbar />
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
        <h3 className="text-2xl font-bold">
          {coin.symbol}
        </h3>
        <div className="flex gap-6 text-lg">
          <p className="text-gray-400">
            Low {" "}
            <span className="text-red-400">${coin.lowPrice}</span>
          </p>
          <p className="text-gray-400">
            High {" "}
            <span className="text-green-400">
              ${coin.highPrice}
            </span>
          </p>
        </div>
      </div>

      {/* Price Info */}
      <div className="text-center py-4">
        <p className="text-green-400 text-3xl">
          ${coin.current_price}
        </p>
        <p
          className={`text-xl ${
            coin.price_change_percentage_24h >= 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {coin.price_change_percentage_24h}%
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 selected-crypto-main">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "gray" }}>
            Buy/Sell <strong style={{ color: "green" }}> {coin.symbol}</strong>
          </h2>
          <div className="selected-crypto-buttons-container">
            <button
              onClick={() => handleTrade("Buy")}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded w-full"
              style={{ background: "green" }}
            >
              Buy
            </button>
            <button
              onClick={() => handleTrade("Sell")}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded w-full"
              style={{ background: "red" }}
            >
              Sell
            </button>
          </div>
        </div>

      {/* Chart Section */}
      {/* <div className="w-screen h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="gray" />
            <XAxis dataKey="time" tick={{ fill: "white" }} />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "white" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e1e1e", color: "white" }}
            />
            <Bar dataKey="open" fill="red" barSize={5} />
            <Bar dataKey="close" fill="green" barSize={5} />
            <Line type="monotone" dataKey="high" stroke="white" strokeWidth={2} />
            <Line type="monotone" dataKey="low" stroke="white" strokeWidth={2} />
            <Brush dataKey="time" height={30} stroke="#8884d8" />
          </ComposedChart>
        </ResponsiveContainer>
      </div> */}
      <TradePopup
        cryptoData={cryptoData}
        isOpen={isTradePopupOpen}
        onClose={() => setTradePopupOpen(false)}
        tradeType={tradeType} // Pass the trade type to the popup
      />
      <BottomNavigation/>
    </div>
  );
};

export default Chart;
