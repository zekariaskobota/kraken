import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { showToast } from '../../utils/toast';
import { BACKEND_URL } from '../../services/apiConfig';
import TradePopup from '../TradePopup/TradePopup';

const OrderEntryPanel = ({ symbol, currentPrice, balance, user, defaultSide }) => {
  const [orderType, setOrderType] = useState('market'); // market, limit, stop, stopLimit
  const [side, setSide] = useState(defaultSide || 'buy'); // buy or sell
  
  useEffect(() => {
    if (defaultSide) {
      setSide(defaultSide);
    }
  }, [defaultSide]);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [userId, setUserId] = useState('');
  const [isTradePopupOpen, setIsTradePopupOpen] = useState(false);
  const [cryptoData, setCryptoData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (orderType === 'market' && quantity && currentPrice) {
      const total = parseFloat(quantity) * currentPrice;
      setEstimatedTotal(total);
      setEstimatedFee(total * 0.001); // 0.1% fee
    } else if (orderType === 'limit' && quantity && price) {
      const total = parseFloat(quantity) * parseFloat(price);
      setEstimatedTotal(total);
      setEstimatedFee(total * 0.001);
    } else if (orderType === 'stop' && quantity && stopPrice) {
      const total = parseFloat(quantity) * parseFloat(stopPrice);
      setEstimatedTotal(total);
      setEstimatedFee(total * 0.001);
    } else if (orderType === 'stopLimit' && quantity && price && stopPrice) {
      const total = parseFloat(quantity) * parseFloat(price);
      setEstimatedTotal(total);
      setEstimatedFee(total * 0.001);
    } else {
      setEstimatedTotal(0);
      setEstimatedFee(0);
    }
  }, [quantity, price, stopPrice, currentPrice, orderType]);

  useEffect(() => {
    if (currentPrice) {
      setPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice]);

  useEffect(() => {
    // Prepare crypto data for TradePopup
    if (symbol && currentPrice) {
      const cryptoName = symbol.replace('USDT', '');
      setCryptoData({
        name: cryptoName,
        symbol: symbol,
        current_price: currentPrice,
      });
    }
  }, [symbol, currentPrice]);

  const handlePercentageClick = (percent) => {
    setPercentage(percent);
    if (balance && currentPrice) {
      if (side === 'buy') {
        const maxQty = (balance * percent) / 100 / currentPrice;
        setQuantity(maxQty.toFixed(8));
      } else {
        // For sell, we'd need to know available balance of the asset
        // For now, just use a placeholder
        setQuantity((balance * percent / 100 / currentPrice).toFixed(8));
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!user || user.status !== 'Verified') {
      showToast.error("Please verify your identity to place orders");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      showToast.error("Please enter a valid quantity");
      return;
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      showToast.error("Please enter a valid limit price");
      return;
    }

    if ((orderType === 'stop' || orderType === 'stopLimit') && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      showToast.error("Please enter a valid stop price");
      return;
    }

    if (side === 'buy' && estimatedTotal > balance) {
      showToast.error(`You need ${estimatedTotal.toFixed(2)} USDT but only have ${balance.toFixed(2)} USDT`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast.error("Please log in to place orders");
        return;
      }

      // Map to your existing trade API structure
      const tradeData = {
        userId,
        selectedPair: symbol.replace('USDT', ''),
        currentPrice: orderType === 'market' ? currentPrice : parseFloat(price),
        tradeType: side === 'buy' ? 'Buy' : 'Sell',
        expirationTime: orderType, // Using orderType as expiration for now
        tradeAmount: estimatedTotal,
        estimatedIncome: estimatedTotal - estimatedFee,
        winLose: 'Off', // Default
      };

      const response = await fetch(`${BACKEND_URL}/api/trades/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tradeData),
      });

      if (response.ok) {
        showToast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);

        // Reset form
        setQuantity('');
        setPrice(currentPrice?.toFixed(2) || '');
        setStopPrice('');
        setPercentage(0);
      } else {
        const error = await response.json();
        showToast.error(error.message || "Failed to place order. Please try again");
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showToast.error("An error occurred while placing the order");
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="px-3 py-2 border-b border-[#2a2d3a]">
        <div className="flex gap-1">
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              orderType === 'market'
                ? 'bg-teal-500 text-white'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setOrderType('market')}
          >
            Market
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              orderType === 'limit'
                ? 'bg-teal-500 text-white'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setOrderType('limit')}
          >
            Limit
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              orderType === 'stop'
                ? 'bg-teal-500 text-white'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setOrderType('stop')}
          >
            Stop
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              orderType === 'stopLimit'
                ? 'bg-teal-500 text-white'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setOrderType('stopLimit')}
          >
            Stop Limit
          </button>
        </div>
      </div>

      <div className="flex flex-col p-3 gap-3">
        {/* Buy/Sell Toggle */}
        <div className="flex gap-2">
          <button
            className={`flex-1 py-2.5 text-sm font-semibold rounded transition-all ${
              side === 'buy'
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setSide('buy')}
          >
            Buy
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-semibold rounded transition-all ${
              side === 'sell'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                : 'bg-[rgba(11,14,20,0.6)] text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setSide('sell')}
          >
            Sell
          </button>
        </div>

        {/* Quantity Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400">Quantity</label>
          <div className="flex flex-col gap-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              step="0.00000001"
              className="w-full px-3 py-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded text-gray-200 text-sm outline-none focus:border-teal-500 transition-colors"
            />
            <div className="flex gap-1.5">
              {[25, 50, 75, 100].map(percent => (
                <button
                  key={percent}
                  className="flex-1 px-2 py-1 text-xs bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded text-gray-400 hover:text-gray-200 hover:border-teal-500/50 transition-all"
                  onClick={() => handlePercentageClick(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price Input (for limit orders) */}
        {(orderType === 'limit' || orderType === 'stopLimit') && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Price (USDT)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded text-gray-200 text-sm outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        )}

        {/* Stop Price Input (for stop orders) */}
        {(orderType === 'stop' || orderType === 'stopLimit') && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Stop Price (USDT)</label>
            <input
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded text-gray-200 text-sm outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#2a2d3a]">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Total</span>
            <span className="text-gray-200">${estimatedTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Estimated Fee</span>
            <span className="text-gray-200">${estimatedFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Available Balance</span>
            <span className="text-gray-200">${balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Submit Button - Opens Trade Popup */}
        <button
          className={`w-full py-3 text-sm font-semibold rounded transition-all ${
            side === 'buy'
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30'
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30'
          }`}
          onClick={() => setIsTradePopupOpen(true)}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol.replace('USDT', '')}
        </button>
      </div>

      {/* Trade Popup */}
      {cryptoData && (
        <TradePopup
          cryptoData={cryptoData}
          isOpen={isTradePopupOpen}
          onClose={() => setIsTradePopupOpen(false)}
          tradeType={side === 'buy' ? 'Buy' : 'Sell'}
        />
      )}
    </div>
  );
};

export default OrderEntryPanel;

