import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WatchlistPanel = ({ selectedSymbol, onSymbolSelect }) => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const data = response.data;

        const topCryptos = data
          .filter((coin) => coin.symbol.endsWith('USDT'))
          .map((coin, index) => ({
            rank: index + 1,
            symbol: coin.symbol,
            name: coin.symbol.replace('USDT', ''),
            price: parseFloat(coin.lastPrice),
            change: parseFloat(coin.priceChangePercent),
            volume: parseFloat(coin.volume),
            quoteVolume: parseFloat(coin.quoteVolume),
          }))
          .sort((a, b) => b.quoteVolume - a.quoteVolume)
          .slice(0, 30);

        setCryptoData(topCryptos);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = cryptoData.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(8);
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="px-3 py-2 border-b border-[#2a2d3a]">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">Markets</h3>
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-2 py-1.5 text-xs bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded text-gray-200 placeholder:text-gray-500 outline-none focus:border-teal-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="w-6 h-6 border-2 border-[#2a2d3a] border-t-teal-500 rounded-full animate-spin"></div>
            <span className="text-xs text-gray-400">Loading...</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredData.map((crypto) => (
              <div
                key={crypto.symbol}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[rgba(38,166,154,0.1)] transition-colors border-b border-[#2a2d3a]/50 ${
                  selectedSymbol === crypto.symbol ? 'bg-[rgba(38,166,154,0.15)] border-l-2 border-l-teal-500' : ''
                }`}
                onClick={() => onSymbolSelect(crypto.symbol)}
              >
                <div className="text-xs text-gray-500 w-6">{crypto.rank}</div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-gray-200">{crypto.name}</span>
                    <span className="text-xs text-gray-500">/</span>
                    <span className="text-xs text-gray-400">USDT</span>
                    <span className="text-[10px] ml-1">🔥</span>
                  </div>
                  <div className="text-[10px] text-gray-500">Vol: {formatVolume(crypto.quoteVolume)} USDT</div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="text-xs font-medium text-gray-200">{formatPrice(crypto.price)}</div>
                  <div
                    className={`text-[10px] font-medium ${
                      crypto.change >= 0 ? 'text-teal-400' : 'text-red-400'
                    }`}
                  >
                    {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPanel;

