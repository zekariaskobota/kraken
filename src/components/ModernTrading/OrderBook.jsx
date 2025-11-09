import React, { useEffect, useState, useRef } from 'react';

const OrderBook = ({ symbol }) => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [maxVolume, setMaxVolume] = useState(0);
  const wsRef = useRef(null);

  useEffect(() => {
    // Fetch initial order book
    const fetchOrderBook = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`
        );
        const data = await response.json();

        const bids = data.bids.map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        })).sort((a, b) => b.price - a.price);

        const asks = data.asks.map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        })).sort((a, b) => a.price - b.price);

        setOrderBook({ bids, asks });
        
        const allVolumes = [...bids, ...asks].map(o => o.quantity);
        setMaxVolume(Math.max(...allVolumes));
      } catch (error) {
        console.error('Error fetching order book:', error);
      }
    };

    fetchOrderBook();

    // WebSocket for real-time updates
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const bids = data.bids.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
      })).sort((a, b) => b.price - a.price);

      const asks = data.asks.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
      })).sort((a, b) => a.price - b.price);

      setOrderBook({ bids, asks });
      
      const allVolumes = [...bids, ...asks].map(o => o.quantity);
      setMaxVolume(Math.max(...allVolumes));
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

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex justify-between items-center px-3 py-2 border-b border-[#2a2d3a]">
        <h3 className="text-sm font-semibold text-gray-200">Order Book</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Grouping</span>
          <select className="px-2 py-1 text-xs bg-[#1a1d29] border border-[#2a2d3a] rounded text-gray-200 cursor-pointer outline-none">
            <option>0.01</option>
            <option>0.1</option>
            <option>1</option>
            <option>10</option>
          </select>
        </div>
      </div>
      
      <div className="flex flex-col h-full overflow-hidden">
        {/* Asks (Sell Orders) */}
        <div className="flex flex-col-reverse">
          {orderBook.asks.slice(0, 10).map((ask, index) => (
            <div key={index} className="relative flex items-center px-3 py-1 hover:bg-[rgba(239,83,80,0.1)] group">
              <div className="flex-1 flex items-center gap-4 text-xs">
                <div className="text-red-400 font-medium w-24 text-right">{formatPrice(ask.price)}</div>
                <div className="text-gray-300 w-20 text-right">{formatQuantity(ask.quantity)}</div>
                <div className="text-gray-300 w-24 text-right">{formatQuantity(ask.quantity * ask.price)}</div>
              </div>
              <div
                className="absolute right-0 top-0 bottom-0 bg-red-500/20 opacity-30 group-hover:opacity-40 transition-opacity"
                style={{ width: `${(ask.quantity / maxVolume) * 100}%` }}
              />
            </div>
          ))}
        </div>

        {/* Spread */}
        {orderBook.bids.length > 0 && orderBook.asks.length > 0 && (
          <div className="flex justify-between items-center px-3 py-2 bg-[rgba(42,45,58,0.3)] border-y border-[#2a2d3a] text-xs text-gray-400">
            <span>Spread: {formatPrice(orderBook.asks[0].price - orderBook.bids[0].price)}</span>
            <span>
              ({(((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price) * 100).toFixed(2)}%)
            </span>
          </div>
        )}

        {/* Bids (Buy Orders) */}
        <div className="flex flex-col">
          {orderBook.bids.slice(0, 10).map((bid, index) => (
            <div key={index} className="relative flex items-center px-3 py-1 hover:bg-[rgba(38,166,154,0.1)] group">
              <div className="flex-1 flex items-center gap-4 text-xs">
                <div className="text-teal-400 font-medium w-24 text-right">{formatPrice(bid.price)}</div>
                <div className="text-gray-300 w-20 text-right">{formatQuantity(bid.quantity)}</div>
                <div className="text-gray-300 w-24 text-right">{formatQuantity(bid.quantity * bid.price)}</div>
              </div>
              <div
                className="absolute right-0 top-0 bottom-0 bg-teal-500/20 opacity-30 group-hover:opacity-40 transition-opacity"
                style={{ width: `${(bid.quantity / maxVolume) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

