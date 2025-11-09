import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
  ont: "ont.png"
};

// Default crypto coin icon as SVG data URI - Modern coin design with teal theme
// Simplified and more reliable SVG that will always render
const defaultIconSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2314b8a6'/%3E%3Cstop offset='100%25' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='14' fill='url(%23g)'/%3E%3Cpath d='M16 8 L18 12 L22 13 L19 16 L22 19 L18 20 L16 24 L14 20 L10 19 L13 16 L10 13 L14 12 Z' fill='white'/%3E%3C/svg%3E";

const defaultIconUrl = defaultIconSvg;

const getCryptoIcon = (symbol) => {
  const symbolLower = symbol.toLowerCase();
  
  // First check local icon map
  if (cryptoIconMap[symbolLower]) {
    const localIcon = cryptoIconMap[symbolLower];
    // If it's a URL, return it directly, otherwise assume it's in public folder
    return localIcon.startsWith('http') ? localIcon : `/${localIcon}`;
  }
  
  // Use cryptoicons.org API - works with symbols directly and has good coverage
  // This service is more reliable for symbol-based lookups
  return `https://cryptoicons.org/api/icon/${symbolLower}/200`;
};

const ModernWatchlist = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("USDT");
  const [sortBy, setSortBy] = useState("price"); // volume, change, price
  const [displayCount, setDisplayCount] = useState(10); // Start with 10 items

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 5000);
    return () => clearInterval(interval);
  }, [sortBy, filter]);

  const fetchCryptoData = async () => {
    try {
      const marketUrl = "https://api.binance.com/api/v3/ticker/24hr";
      const { data } = await axios.get(marketUrl);

      const cryptos = data
        .filter((coin) => coin.symbol.endsWith(filter))
        .map((coin, index) => ({
          rank: index + 1,
          symbol: coin.symbol,
          name: coin.symbol.replace(filter, ""),
          price: parseFloat(coin.lastPrice),
          change24h: parseFloat(coin.priceChangePercent),
          volume24h: parseFloat(coin.volume),
          quoteVolume: parseFloat(coin.quoteVolume),
        }))
        .sort((a, b) => {
          if (sortBy === "volume") return b.quoteVolume - a.quoteVolume;
          if (sortBy === "change") return b.change24h - a.change24h;
          if (sortBy === "price") return b.price - a.price; // Sort by price descending (highest first)
          return b.price - a.price; // Default to price
        })
        .slice(0, 50);

      setCryptoData(cryptos);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      setLoading(false);
    }
  };

  const filteredData = cryptoData.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset display count when filter or search changes
  useEffect(() => {
    setDisplayCount(10);
  }, [filter, searchTerm, sortBy]);

  // Get the items to display
  const displayedData = filteredData.slice(0, displayCount);
  const hasMore = filteredData.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, filteredData.length));
  };

  const formatPrice = (price) => {
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    if (price >= 0.0001) return price.toFixed(6);
    return price.toFixed(8);
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  return (
    <div className="bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-2xl sm:rounded-none p-3 sm:p-4 md:p-5 m-0 w-full max-w-full box-border sm:border-l-0 sm:border-r-0">
      <div className="mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] sm:min-w-full">
            <input
              type="text"
              placeholder="Search trading pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-gray-200 text-xs sm:text-sm transition-all focus:outline-none focus:border-teal-500 focus:bg-[rgba(11,14,20,0.8)] placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-gray-200 text-xs sm:text-sm cursor-pointer transition-all focus:outline-none focus:border-teal-500"
            >
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="BNB">BNB</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-gray-200 text-xs sm:text-sm cursor-pointer transition-all focus:outline-none focus:border-teal-500"
            >
              <option value="volume">Volume</option>
              <option value="change">24h Change</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-5 gap-4">
            <div className="w-10 h-10 border-3 border-[#2a2d3a] border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-xs sm:text-sm">Loading markets...</p>
          </div>
        ) : (
          <div className="w-full min-w-0">
            <div className="grid grid-cols-[50px_2fr_1.2fr_1.1fr] sm:grid-cols-[40px_2fr_1fr_1fr] md:grid-cols-[36px_2fr_1fr_0.8fr] gap-2 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-[rgba(11,14,20,0.4)] rounded-lg mb-2 text-[10px] sm:text-[9px] md:text-[8px] font-medium text-gray-400 items-center">
              <div></div>
              <div className="text-left">Trading Pair / Vol</div>
              <div className="text-left">Price</div>
              <div className="text-right">24H Change</div>
            </div>
            <div className="flex flex-col gap-1">
              {displayedData.map((coin) => (
                <Link
                  to={`/watchlistchart/${coin.name.toLowerCase()}`}
                  state={{ cryptoData: {
                    symbol: coin.name,
                    name: coin.name,
                    current_price: coin.price,
                    price_change_percentage_24h: coin.change24h,
                    lowPrice: coin.price * 0.95,
                    highPrice: coin.price * 1.05,
                    volume: coin.volume24h,
                    quoteVolume: coin.quoteVolume
                  }}}
                  key={coin.symbol}
                  className="grid grid-cols-[50px_2fr_1.2fr_1.1fr] sm:grid-cols-[40px_2fr_1fr_1fr] md:grid-cols-[36px_2fr_1fr_0.8fr] gap-2 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 md:py-2.5 md:px-2 bg-[rgba(11,14,20,0.3)] border border-transparent rounded-lg no-underline text-inherit transition-all cursor-pointer items-center hover:bg-teal-500/10 hover:border-teal-500 hover:translate-x-1"
                >
                  <div className="flex items-center justify-start">
                    <img 
                      src={getCryptoIcon(coin.name)} 
                      alt={coin.name}
                      className="w-8 h-8 sm:w-7 sm:h-7 md:w-6 md:h-6"
                      loading="lazy"
                      onError={(e) => {
                        if (e.target.dataset.fallback === 'true' || e.target.src === defaultIconUrl || e.target.src.includes('data:image/svg+xml')) {
                          if (e.target.src !== defaultIconUrl) {
                            e.target.src = defaultIconUrl;
                          }
                          return;
                        }
                        const symbolLower = coin.name.toLowerCase();
                        const currentSrc = e.target.src;
                        if (currentSrc.includes('cryptoicons.org')) {
                          e.target.src = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbolLower}.png`;
                          e.target.dataset.fallback = '1';
                        } else if (currentSrc.includes('github') || currentSrc.includes('spothq')) {
                          e.target.src = defaultIconUrl;
                          e.target.dataset.fallback = 'true';
                        } else {
                          e.target.src = defaultIconUrl;
                          e.target.dataset.fallback = 'true';
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 items-start justify-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm sm:text-[13px] md:text-xs font-semibold text-white">{coin.name}</span>
                      <span className="text-xs sm:text-sm text-gray-500">/</span>
                      <span className="text-xs sm:text-sm text-gray-400">{filter}</span>
                      <span className="text-xs ml-1">🔥</span>
                    </div>
                    <div className="hidden sm:block text-xs text-gray-500">
                      Vol: {formatVolume(coin.quoteVolume)} {filter}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <div className="text-sm sm:text-[13px] md:text-xs font-semibold text-white">{formatPrice(coin.price)}</div>
                    <div className="text-xs text-gray-500">≈{formatPrice(coin.price)} USD</div>
                  </div>
                  <div className="flex items-center justify-end min-w-0">
                    <span
                      className={`px-1.5 sm:px-2 md:px-1.5 py-0.5 sm:py-1 md:py-0.5 rounded-md text-[10px] sm:text-[11px] md:text-[10px] font-semibold whitespace-nowrap text-center flex-shrink-0 ${
                        coin.change24h >= 0 
                          ? "text-white bg-teal-500" 
                          : "text-white bg-red-500"
                      }`}
                    >
                      {coin.change24h >= 0 ? "+" : ""}
                      {coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="flex justify-center items-center py-4 sm:py-5 mt-4">
            <button
              onClick={handleLoadMore}
              className="px-6 sm:px-5 md:px-4 py-3 sm:py-2.5 md:py-2 bg-gradient-to-r from-teal-500 to-teal-600 border-none rounded-lg text-white text-sm sm:text-xs md:text-[11px] font-semibold cursor-pointer transition-all shadow-lg shadow-teal-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/40 hover:from-teal-600 hover:to-teal-500 active:translate-y-0"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernWatchlist;

