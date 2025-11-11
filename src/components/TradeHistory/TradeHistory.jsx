// TradeHistory.js
import React, { useState, useEffect } from "react";
import tradeHistoryController from "../../controllers/tradeHistoryController";
import config from "../../config";
import { FaTimes } from "react-icons/fa";
import ConfirmPopup from "../ConfirmPopup/ConfirmPopup";
import { showToast } from "../../utils/toast";

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage, setTradesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, tradeId: null });

  useEffect(() => {
    tradeHistoryController.getTrades(setTrades, setTotalPages, setError);
  }, [tradesPerPage]);

  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = [...trades]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(indexOfFirstTrade, indexOfLastTrade);

  const handleCancelTrade = (tradeId) => {
    setConfirmPopup({ isOpen: true, tradeId });
  };

  const confirmCancelTrade = async () => {
    const tradeId = confirmPopup.tradeId;
    if (!tradeId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        showToast.error("Authentication required");
        return;
      }

      const response = await fetch(
        `${config.BACKEND_URL}/api/trades/cancel/${tradeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove cancelled trade from state
        setTrades((prev) => prev.filter((dep) => dep._id !== tradeId));
        showToast.success("Trade has been cancelled successfully");
      } else {
        console.error("Error cancelling trade:", data.message);
        showToast.error(data.message || "Failed to cancel trade");
      }
    } catch (error) {
      console.error("Error cancelling trade:", error);
      showToast.error("An error occurred. Please try again");
    }
  };
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d3a]">
            {currentTrades.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  No trade history available
                </td>
              </tr>
            ) : (
              currentTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-[rgba(38,166,154,0.05)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">{trade.tradePair}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{trade.tradeType}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{trade.expirationTime}</td>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium hover:bg-teal-500/20 transition-colors"
                        onClick={() => setSelectedTrade(trade)}
                      >
                        View
                      </button>
                      {trade.status !== "Completed" && (
                        <button
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                          onClick={() => handleCancelTrade(trade._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
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

      {/* Modal for Trade Details */}
      {selectedTrade && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-[rgba(26,29,41,0.95)] border border-[#2a2d3a] rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Trade Details
              </h3>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setSelectedTrade(null)}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Crypto Type</span>
                <p className="text-sm font-semibold text-white">{selectedTrade.tradePair}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Trade Type</span>
                <p className="text-sm font-semibold text-white">{selectedTrade.tradeType}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Expiration Time</span>
                <p className="text-sm font-semibold text-white">{selectedTrade.expirationTime}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Traded Amount</span>
                <p className="text-sm font-semibold text-white">${selectedTrade.tradingAmountUSD}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Transaction Fee</span>
                <p className="text-sm font-semibold text-white">0.5</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Profit</span>
                <p className={`text-sm font-semibold ${parseFloat(selectedTrade.estimatedIncome) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  ${selectedTrade.estimatedIncome}
                </p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Status</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedTrade.status === "Completed"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : selectedTrade.status === "Rejected"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {selectedTrade.status}
                </span>
              </div>
              {selectedTrade.winLose && (
                <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                  <span className="text-sm text-gray-400">Win/Lose</span>
                  <p className={`text-sm font-semibold ${selectedTrade.winLose === "Win" ? 'text-teal-400' : 'text-red-400'}`}>
                    {selectedTrade.winLose}
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Traded At</span>
                <p className="text-sm text-gray-300">{new Date(selectedTrade.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <button
              className="mt-6 w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
              onClick={() => setSelectedTrade(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false, tradeId: null })}
        onConfirm={confirmCancelTrade}
        title="Cancel Trade"
        message="Are you sure you want to cancel this trade? This action cannot be undone."
        type="warning"
        confirmText="Yes, cancel it"
        cancelText="No, keep it"
      />
    </div>
  );
};

export default TradeHistory;
