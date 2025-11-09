import React, { useEffect, useState } from "react";
import axios from "axios";

const AllWatchlist = () => {
  const [activeTab, setActiveTab] = useState("crypto");
  const [cryptoData, setCryptoData] = useState([]);

  const forexData = [
    { name: "EUR/USD", price: 1.0987, change: 0.12 },
    { name: "USD/JPY", price: 133.25, change: -0.34 },
  ];

  const goldData = [
    { name: "Gold (XAU/USD)", price: 2345.22, change: -0.2 },
    { name: "Silver (XAG/USD)", price: 27.89, change: 0.45 },
  ];

  useEffect(() => {
    if (activeTab === "crypto") {
      axios
        .get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 10,
            page: 1,
            sparkline: false,
            price_change_percentage: "24h",
          },
        })
        .then((res) => setCryptoData(res.data))
        .catch((err) => {
          // Error handling without console.log
        });
    }
  }, [activeTab]);

  const getTabData = () => {
    switch (activeTab) {
      case "crypto":
        return cryptoData.map((coin) => ({
          name: coin.symbol.toUpperCase(),
          logo: coin.image,
          price: coin.current_price,
          change: coin.price_change_percentage_24h,
        }));
      case "forex":
        return forexData;
      case "gold":
        return goldData;
      default:
        return [];
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-700 shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Market Dynamics</h2>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        {["crypto", "forex", "gold"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
              activeTab === tab
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">Name</th>
              {activeTab === "crypto" && <th className="py-2">Logo</th>}
              <th className="py-2">Price</th>
              <th className="py-2">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {getTabData().map((item, index) => (
              <tr key={index} className="border-b text-sm">
                <td className="py-2">{item.name}</td>
                {item.logo && (
                  <td>
                    <img src={item.logo} alt={item.name} className="w-5 h-5" />
                  </td>
                )}
                <td>${item.price?.toFixed(4)}</td>
                <td
                  className={`${
                    item.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {item.change?.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllWatchlist;