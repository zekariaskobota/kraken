import React from 'react';
import UnifiedRealTimeChart from './UnifiedRealTimeChart';

const ForexChart = ({ symbol = 'EURUSD' }) => {
  // Convert forex symbol to format expected (e.g., EURUSD -> EURUSDUSDT for Binance API)
  // Note: For real forex pairs, you may need a different data source
  return <UnifiedRealTimeChart symbol={symbol} type="forex" />;
};

export default ForexChart;