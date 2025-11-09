import React, { useState, useEffect } from "react";
import BottomNavigation from "../BottomNavigation/BottomNavigation";
import config from "../../config";
import Swal from "sweetalert2";
import { FaTimes, FaEye, FaBan } from "react-icons/fa";

const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawalsPerPage, setWithdrawalsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch withdrawal history data for the logged-in user
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the JWT token from storage
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(
          `${config.BACKEND_URL}/api/withdrawals/all-my-Withdrawals`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data.withdrawals) {
          const sortedWithdrawals = data.withdrawals.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setWithdrawals(sortedWithdrawals);
          setTotalPages(
            Math.ceil(sortedWithdrawals.length / withdrawalsPerPage)
          );
        } else {
          console.error("Error fetching withdrawal history:", data.error);
        }
      } catch (error) {
        console.error("Error fetching withdrawal history:", error);
      }
    };

    fetchWithdrawals();
  }, [withdrawalsPerPage]);

  // Calculate the withdrawals to display for the current page
  const indexOfLastWithdrawal = currentPage * withdrawalsPerPage;
  const indexOfFirstWithdrawal = indexOfLastWithdrawal - withdrawalsPerPage;
  const currentWithdrawals = withdrawals.slice(
    indexOfFirstWithdrawal,
    indexOfLastWithdrawal
  );

  const handleCancelWithdrawal = async (withdrawalId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this withdrawal?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(
        `${config.BACKEND_URL}/api/withdrawals/cancel/${withdrawalId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove cancelled deposit from state
        setWithdrawals((prev) => prev.filter((dep) => dep._id !== withdrawalId));

        Swal.fire("Cancelled!", "Withdrawal has been cancelled.", "success");
      } else {
        console.error("Error cancelling Withdrawal:", data.message);
        Swal.fire(
          "Error",
          data.message || "Failed to cancel Withdrawal.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error cancelling Withdrawal:", error);
      Swal.fire("Error", "An error occurred. Please try again.", "error");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Controls */}
      <div className="flex justify-between items-center mb-2">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          Rows per page:
          <select
            className="px-3 py-1.5 bg-[rgba(11,14,20,0.6)] border border-[#2a2d3a] rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
            value={withdrawalsPerPage}
            onChange={(e) => {
              setWithdrawalsPerPage(Number(e.target.value));
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Network</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d3a]">
            {currentWithdrawals.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                  No withdrawal history available
                </td>
              </tr>
            ) : (
              currentWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-[rgba(38,166,154,0.05)] transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">${withdrawal.amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono max-w-xs truncate">{withdrawal.withdrawalAddress}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{withdrawal.withdrawalNetwork}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        withdrawal.Status === "Approved"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : withdrawal.Status === "Pending"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : withdrawal.Status === "Rejected"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {withdrawal.Status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(withdrawal.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium hover:bg-teal-500/20 transition-colors"
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                      >
                        View
                      </button>
                      {withdrawal.Status !== "Approved" && (
                        <button
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                          onClick={() => handleCancelWithdrawal(withdrawal._id)}
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

      {/* Modal for Withdrawal Details */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-[rgba(26,29,41,0.95)] border border-[#2a2d3a] rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Withdrawal Details
              </h3>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setSelectedWithdrawal(null)}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Amount</span>
                <p className="text-sm font-semibold text-white">${selectedWithdrawal.amount}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Address</span>
                <p className="text-sm font-mono text-gray-300 max-w-xs truncate">{selectedWithdrawal.withdrawalAddress}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Network</span>
                <p className="text-sm font-semibold text-white">{selectedWithdrawal.withdrawalNetwork}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Status</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedWithdrawal.Status === "Approved"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : selectedWithdrawal.Status === "Pending"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {selectedWithdrawal.Status}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Withdrawn At</span>
                <p className="text-sm text-gray-300">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <button
              className="mt-6 w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
              onClick={() => setSelectedWithdrawal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;
