import React, { useEffect, useState, useRef } from 'react';

const RecentTrades = ({ symbol }) => {
  const [trades, setTrades] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // Fetch recent trades
    const fetchRecentTrades = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=50`
        );
        const data = await response.json();

        const formattedTrades = data.map(trade => ({
          id: trade.id,
          price: parseFloat(trade.price),
          quantity: parseFloat(trade.qty),
          time: trade.time,
          isBuyerMaker: trade.isBuyerMaker,
        })).reverse();

        setTrades(formattedTrades);
      } catch (error) {
        console.error('Error fetching recent trades:', error);
      }
    };

    fetchRecentTrades();

    // WebSocket for real-time updates
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (event) => {
      const trade = JSON.parse(event.data);

      const newTrade = {
        id: trade.t,
        price: parseFloat(trade.p),
        quantity: parseFloat(trade.q),
        time: trade.T,
        isBuyerMaker: trade.m,
      };

      setTrades(prev => {
        const updated = [newTrade, ...prev].slice(0, 50);
        return updated;
      });
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol]);

  const formatPrice = (price) => {
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(8);
  };

  const formatQuantity = (qty) => {
    if (qty >= 1) return qty.toFixed(4);
    if (qty >= 0.01) return qty.toFixed(6);
    return qty.toFixed(8);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent border-t border-[#2a2d3a]">
      <div className="px-3 py-2 border-b border-[#2a2d3a]">
        <h3 className="text-sm font-semibold text-gray-200">Recent Trades</h3>
      </div>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="grid grid-cols-3 gap-4 px-3 py-2 bg-[rgba(11,14,20,0.4)] text-xs text-gray-400 font-medium">
          <span>Price (USDT)</span>
          <span>Amount</span>
          <span>Time</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {trades.map((trade, index) => (
            <div
              key={`${trade.id}-${index}`}
              className={`grid grid-cols-3 gap-4 px-3 py-1 text-xs hover:bg-[rgba(42,45,58,0.2)] transition-colors ${
                trade.isBuyerMaker ? 'bg-[rgba(239,83,80,0.05)]' : 'bg-[rgba(38,166,154,0.05)]'
              }`}
            >
              <span className={`font-medium ${
                trade.isBuyerMaker ? 'text-red-400' : 'text-teal-400'
              }`}>
                {formatPrice(trade.price)}
              </span>
              <span className="text-gray-300">{formatQuantity(trade.quantity)}</span>
              <span className="text-gray-400">{formatTime(trade.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentTrades;

