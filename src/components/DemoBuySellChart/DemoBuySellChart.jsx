import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import BottomNavigation from "../BottomNavigation/BottomNavigation";
import DemoPopup from "../DemoPopup/DemoPopup";
import axios from "axios";
import { FaArrowLeft, FaArrowUp, FaArrowDown, FaCoins } from "react-icons/fa";

const DemoBuySellChart = () => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [cryptoData, setCryptoData] = useState(null);
  const [tradeType, setTradeType] = useState("Buy");
  const [loading, setLoading] = useState(true);
  const [isTradePopupOpen, setTradePopupOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  const { symbol } = location.state.cryptoData || {};
  const coin = location.state.cryptoData;


  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 5000); // Auto-refresh every 5 seconds
    setSelectedCrypto(symbol);
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

      setLoading(false);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      setLoading(false);
    }
  };
  const handleTrade = (action) => {
    if (selectedCrypto && cryptoData) {
      setTradeType(action);
      setTradePopupOpen(true);
    }
  };
  

  useEffect(() => {
    console.log("Symbol in advanced chart:", symbol);
    if (!symbol) {
      console.error("Symbol is required for the chart to load.");
      return;
    }

    setIsLoading(true);

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Responsive height based on screen size
    const getChartHeight = () => {
      if (window.innerWidth <= 768) {
        return 500; // Small screens
      }
      return 600; // Desktop
    };

    // Create a new chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: getChartHeight(),
      layout: {
        textColor: "#D9D9D9",
        background: { type: "solid", color: "#0b0e14" },
      },
      grid: {
        vertLines: { color: "#2a2d3a" },
        horzLines: { color: "#2a2d3a" },
      },
      crosshair: { mode: 0 },
      timeScale: { timeVisible: true, secondsVisible: true },
    });

    console.log("Chart object:", chart);

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
      backgroundColor: "#0b0e14",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const fetchInitialData = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=1d&limit=365`
        );
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response");
        }

        const formatted = data.map((d) => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));

        console.log("Formatted Data:", formatted);

        candleSeriesRef.current.setData(formatted);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading candlestick data:", err);
        setIsLoading(false);
      }
    };

    fetchInitialData();

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@kline_1m`
    );

    ws.onopen = () => console.log("WebSocket connected");
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket closed");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      const candlestick = msg.k;

      candleSeriesRef.current.update({
        time: candlestick.t / 1000,
        open: parseFloat(candlestick.o),
        high: parseFloat(candlestick.h),
        low: parseFloat(candlestick.l),
        close: parseFloat(candlestick.c),
      });
    };

    // Responsive resize
    const observer = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        const newHeight = getChartHeight();
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: newHeight,
          backgroundColor: "#0b0e14",
        });
      }
    });
    
    // Also handle window resize for responsive height
    const handleWindowResize = () => {
      if (chartRef.current) {
        const newHeight = getChartHeight();
        chart.applyOptions({
          height: newHeight,
        });
      }
    };
    
    window.addEventListener('resize', handleWindowResize);
    observer.observe(chartContainerRef.current);

    // Cleanup on unmount or symbol change
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      window.removeEventListener('resize', handleWindowResize);
      observer.disconnect();
      chart.remove();
    };
  }, [symbol]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/demo")}
            className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors mb-4"
          >
            <FaArrowLeft /> Back to Demo
          </button>
          
          {/* Crypto Info Card */}
          <div className="bg-gradient-to-br from-[rgba(26,29,41,0.9)] via-[rgba(11,14,20,0.8)] to-[rgba(26,29,41,0.9)] border border-[#2a2d3a] rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20">
                    <FaCoins className="text-teal-400 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{coin.symbol}</h2>
                    <p className="text-sm text-gray-400">Demo Trading</p>
                  </div>
                </div>
              </div>
              
              {/* Price Display */}
              <div className="text-right">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                  ${coin.current_price?.toFixed(4) || "0.0000"}
                </p>
                <div className="flex items-center justify-end gap-2">
                  {coin.price_change_percentage_24h >= 0 ? (
                    <FaArrowUp className="text-green-400" />
                  ) : (
                    <FaArrowDown className="text-red-400" />
                  )}
                  <p
                    className={`text-lg font-semibold ${
                      coin.price_change_percentage_24h >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                  </p>
                </div>
              </div>
            </div>

            {/* High/Low Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#2a2d3a]">
              <div className="bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">24h High</p>
                <p className="text-lg font-bold text-green-400">${coin.highPrice?.toFixed(4) || "0.0000"}</p>
              </div>
              <div className="bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">24h Low</p>
                <p className="text-lg font-bold text-red-400">${coin.lowPrice?.toFixed(4) || "0.0000"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-4 md:p-6 mb-6 shadow-xl overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(11,14,20,0.8)] backdrop-blur-sm z-10 rounded-2xl">
              <div className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                  </div>
                </div>
                <p className="text-gray-400">Loading chart data...</p>
              </div>
            </div>
          )}
          <div
            ref={chartContainerRef}
            className="chart-container rounded-xl overflow-hidden relative w-full h-[500px] md:h-[600px]"
            style={{
              backgroundColor: "#0b0e14",
            }}
          />
        </div>

        {/* Trading Panel */}
        <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20">
              <FaCoins className="text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Trade {coin.symbol}</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTrade("Buy")}
              disabled={!cryptoData}
              className="px-6 py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaArrowUp /> Buy
            </button>
            <button
              onClick={() => handleTrade("Sell")}
              disabled={!cryptoData}
              className="px-6 py-4 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaArrowDown /> Sell
            </button>
          </div>
        </div>

        {/* Trade Popup */}
        <DemoPopup
          cryptoData={cryptoData}
          isOpen={isTradePopupOpen}
          onClose={() => setTradePopupOpen(false)}
          tradeType={tradeType}
        />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default DemoBuySellChart;
