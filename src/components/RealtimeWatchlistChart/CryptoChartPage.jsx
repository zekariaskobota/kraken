import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const CryptoChartPage = () => {
  const { state } = useLocation();
  const { cryptoData } = state;
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDetailedChart = async () => {
      if (!cryptoData?.symbol) return;
  
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${cryptoData.symbol.toUpperCase()}USDT&interval=1m&limit=100`
        );
        const formattedData = response.data.map(([time, open, high, low, close]) => ({
          time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: parseFloat(close),
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching detailed chart:", error.response?.data || error.message);
      }
    };
  
    fetchDetailedChart();
    const interval = setInterval(fetchDetailedChart, 5000);
    return () => clearInterval(interval);
  }, [cryptoData?.symbol]);
  

  if (!cryptoData) {
    return <div className="text-white p-4">No crypto data provided.</div>;
  }
  

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">
        {cryptoData.name} Live Chart
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <XAxis dataKey="time" />
          <YAxis domain={["dataMin", "dataMax"]} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#00bcd4" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CryptoChartPage;
