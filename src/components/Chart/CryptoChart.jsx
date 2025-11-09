import React from 'react';
import UnifiedRealTimeChart from './UnifiedRealTimeChart';

const CryptoChart = ({ symbol = 'BTCUSDT' }) => {
  return <UnifiedRealTimeChart symbol={symbol} type="crypto" />;
};

export default CryptoChart; 
