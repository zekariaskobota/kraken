import { useParams } from "react-router-dom";
import React,{ useEffect, useState } from "react";

const API_KEY = "your_api_key_here"; // Replace with your Twelve Data API key

export default function Chart() {
  const { symbol } = useParams();
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const res = await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${API_KEY}`
      );
      const data = await res.json();
      setPrice(data.price);
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="p-0 ">
      <h1 className="text-2xl font-bold mb-4">Chart: {symbol}</h1>
      <div className="text-3xl text-blue-600 font-semibold">
        {price ? `$${parseFloat(price).toFixed(2)}` : "Loading..."}
      </div>
    </div>
  );
}
