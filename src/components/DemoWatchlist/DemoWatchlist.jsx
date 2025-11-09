import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const cryptoIconMap = {
  btc: "bitcoin.png",
  eth: "ethereum.png",
  bnb: "bnb.png",
  bcc: "bitconnect.png",
  ltc: "LTC.png",
  xrp: "xrp.png",
  ada: "cardano.png",
  sol: "sol.png",
  doge: "dogecoin.png",
  dot: "polkadot.png",
  matic: "polygon.png",
  shib: "shiba.png",
  avax: "avalanche.png",
  trx: "trx.png",
  xlm: "stellar.png",
  link: "link.png",
  neo: "neo.png",
  eos: "eos.png",
  tusd: "tusd.png",
  iota: "iota.png",
  qtum: "qtum.png",
  icx: "icx.png",
  ven: "https://cryptologos.cc/logos/vechain-vet-logo.png",
  nuls: "https://cryptologos.cc/logos/nuls-nuls-logo.png",
  vet: "vechain.png",
  ont:"ont.png"
};

const defaultIconUrl = "https://via.placeholder.com/32"; // Placeholder image URL

const DemoWatchlist = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for initial fetch

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchCryptoData = async () => {
    try {
      const marketUrl = "https://api.binance.com/api/v3/ticker/24hr";
      const { data } = await axios.get(marketUrl);

      const topCryptos = data
        .filter((coin) => coin.symbol.endsWith("USDT"))
        .slice(0, 15)
        .map((coin) => ({
          id: coin.symbol.replace("USDT", "").toLowerCase(),
          name: coin.symbol.replace("USDT", ""),
          symbol: coin.symbol.replace("USDT", ""),
          current_price: parseFloat(coin.lastPrice),
          lowPrice: parseFloat(coin.lowPrice),
          highPrice: parseFloat(coin.highPrice),
          price_change_percentage_24h: parseFloat(coin.priceChangePercent),
        }));

      // Fetch candlestick (OHLC) data
      const promises = topCryptos.map(async (coin) => {
        try {
          const chartUrl = `https://api.binance.com/api/v3/klines?symbol=${coin.symbol}USDT&interval=5m&limit=40`;
          const { data: chartData } = await axios.get(chartUrl);
          return {
            ...coin,
            sparkline: chartData.map(([timestamp, open, high, low, close]) => ({
              time: new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              price: parseFloat(close),
            })),
          };
        } catch (error) {
          console.error(`Error fetching chart for ${coin.symbol}:`, error);
          return { ...coin, sparkline: [] };
        }
      });

      const cryptoWithChart = await Promise.all(promises);
      setCryptoData(cryptoWithChart);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
    setLoading(false); // Hide the spinner after data fetch
  };

  return (
    <div className="w-full">
      <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Market Watchlist</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {cryptoData.map((coin, index) => (
              <Link
                to={`/demo-crypto/${coin.id}`}
                state={{ cryptoData: coin }}
                key={coin.id}
                className="group block bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-xl p-4 hover:border-teal-500/50 hover:bg-[rgba(11,14,20,0.8)] transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10"
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left - Icon & Name */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="relative">
                      <img
                        src={cryptoIconMap[coin.id] || defaultIconUrl}
                        alt={coin.name}
                        className="w-10 h-10 rounded-full border-2 border-[#2a2d3a] group-hover:border-teal-500/50 transition-colors"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultIconUrl;
                        }}
                      />
                      {coin.price_change_percentage_24h >= 0 ? (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[rgba(11,14,20,0.6)]"></div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[rgba(11,14,20,0.6)]"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-teal-400 transition-colors">
                        {coin.name}
                      </h3>
                      <p className="text-xs text-gray-400">{coin.symbol}/USDT</p>
                    </div>
                  </div>

                  {/* Center - Sparkline Chart */}
                  <div className="flex-1 min-w-0 px-4">
                    {coin.sparkline.length > 0 ? (
                      <div className="h-12 w-full">
                        <ResponsiveContainer width="100%" height={48}>
                          <LineChart data={coin.sparkline}>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={["dataMin", "dataMax"]} hide />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(26,29,41,0.95)",
                                border: "1px solid #2a2d3a",
                                borderRadius: "8px",
                                color: "white",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke={
                                coin.price_change_percentage_24h >= 0
                                  ? "#10b981"
                                  : "#ef4444"
                              }
                              strokeWidth={2.5}
                              dot={false}
                              animationDuration={500}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-12 flex items-center justify-center">
                        <p className="text-gray-500 text-xs">No Data</p>
                      </div>
                    )}
                  </div>

                  {/* Right - Price & Change */}
                  <div className="flex flex-col items-end flex-shrink-0 min-w-[100px]">
                    <p className="text-lg font-bold text-white mb-1">
                      ${coin.current_price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {coin.price_change_percentage_24h >= 0 ? (
                        <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <p
                        className={`text-sm font-semibold ${
                          coin.price_change_percentage_24h >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DemoWatchlist;
