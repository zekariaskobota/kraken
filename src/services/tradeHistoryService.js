// src/tradeHistoryService.js
import config from "../config";

const fetchTrades = async (token) => {
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${config.BACKEND_URL}/api/trades/alltrades`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error fetching trade history');
  }

  const data = await response.json();
  return data.trades || [];
};

export default {
  fetchTrades,
};