import React, { useState, useEffect } from "react";
import tradeHistoryController from "../../controllers/tradeHistoryController";

const BuySellHistory = ({ tradeType }) => {
  const [trades, setTrades] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage, setTradesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    tradeHistoryController.getTrades((data, total, err) => {
      if (err) {
        setError(err);
        return;
      }
      const filtered = data.filter((trade) => trade.tradeType === tradeType);
      setTrades(filtered);
      setTotalPages(Math.ceil(filtered.length / tradesPerPage));
    });
  }, [tradeType, tradesPerPage]);

  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = [...trades]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(indexOfFirstTrade, indexOfLastTrade);


  return (
    <div className="w-full flex flex-col gap-4">
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</p>}

      {/* Controls */}
      <div className="flex justify-between items-center mb-2">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          Rows per page:
          <select
            className="px-3 py-1.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
            value={tradesPerPage}
            onChange={(e) => {
              setTradesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      {/* Modern Table */}
      <div className="overflow-x-auto rounded-lg border border-[#2a2d3a]">
        <table className="w-full">
          <thead className="bg-[rgba(11,14,20,0.6)] border-b border-[#2a2d3a]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Crypto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Expiration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Profit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Traded At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d3a]">
            {currentTrades.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                  No {tradeType} history available
                </td>
              </tr>
            ) : (
              currentTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-[rgba(38,166,154,0.05)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">{trade.tradePair}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{trade.tradeType}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{trade.expirationTime}s</td>
                  <td className="px-4 py-3 text-sm text-white font-medium">${trade.tradingAmountUSD}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${parseFloat(trade.estimatedIncome) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    ${trade.estimatedIncome}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        trade.status === "Completed"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : trade.status === "Rejected"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {trade.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(trade.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] text-gray-300 rounded-lg text-sm font-medium hover:bg-[rgba(11,14,20,0.8)] hover:border-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] text-gray-300 rounded-lg text-sm font-medium hover:bg-[rgba(11,14,20,0.8)] hover:border-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BuySellHistory;
