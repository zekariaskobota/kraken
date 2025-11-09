// src/tradeHistoryController.js
import tradeHistoryService from "../services/tradeHistoryService";

const getTrades = async (setTrades, setTotalPages, setError) => {
  try {
    const token = localStorage.getItem('token');
    const trades = await tradeHistoryService.fetchTrades(token);
    setTrades(trades);
    setTotalPages(Math.ceil(trades.length / 10)); 
  } catch (error) {
    setError(error.message);
  }
};

export default { getTrades };