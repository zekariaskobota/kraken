import React from 'react';
import UnifiedRealTimeChart from './UnifiedRealTimeChart';

const GoldChart = ({ symbol = 'XAUUSD' }) => {
  // Convert gold symbol to format expected
  return <UnifiedRealTimeChart symbol={symbol} type="gold" />;
};

export default GoldChart;