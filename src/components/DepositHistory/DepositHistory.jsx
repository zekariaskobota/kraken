import React, { useState, useEffect } from "react";
import config from "../../config";
import { FaTimes, FaEye } from "react-icons/fa";
import ConfirmPopup from "../ConfirmPopup/ConfirmPopup";
import { showToast } from "../../utils/toast";

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [imagePopup, setImagePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [depositsPerPage, setDepositsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, depositId: null });

  const getImageUrl = (filename) => `${config.BACKEND_URL}/uploads/${filename}`;

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(
          `${config.BACKEND_URL}/api/deposits/user-deposits`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data.deposits) {
          const sortedDeposits = [...data.deposits].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setDeposits(sortedDeposits);
          setTotalPages(Math.ceil(sortedDeposits.length / depositsPerPage));
        } else {
          console.error("Error fetching deposit history:", data.error);
        }
      } catch (error) {
        console.error("Error fetching deposit history:", error);
      }
    };

    fetchDeposits();
  }, [depositsPerPage]);

  useEffect(() => {
    setTotalPages(Math.ceil(deposits.length / depositsPerPage));
  }, [deposits, depositsPerPage]);

  const indexOfLastDeposit = currentPage * depositsPerPage;
  const indexOfFirstDeposit = indexOfLastDeposit - depositsPerPage;
  const currentDeposits = deposits.slice(
    indexOfFirstDeposit,
    indexOfLastDeposit
  );

  const handleCancelDeposit = (depositId) => {
    setConfirmPopup({ isOpen: true, depositId });
  };

  const confirmCancelDeposit = async () => {
    const depositId = confirmPopup.depositId;
    if (!depositId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        showToast.error("Authentication required");
        return;
      }

      const response = await fetch(
        `${config.BACKEND_URL}/api/deposits/cancel/${depositId}`,
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
        setDeposits((prev) => prev.filter((dep) => dep._id !== depositId));
        showToast.success("Deposit has been cancelled successfully");
      } else {
        console.error("Error cancelling deposit:", data.message);
        showToast.error(data.message || "Failed to cancel deposit");
      }
    } catch (error) {
      console.error("Error cancelling deposit:", error);
      showToast.error("An error occurred. Please try again");
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
            value={depositsPerPage}
            onChange={(e) => {
              setDepositsPerPage(Number(e.target.value));
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">USDT Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Proof</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d3a]">
            {currentDeposits.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                  No deposit history available
                </td>
              </tr>
            ) : (
              currentDeposits.map((deposit) => (
                <tr key={deposit._id} className="hover:bg-[rgba(38,166,154,0.05)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">{deposit.cryptoType}</td>
                  <td className="px-4 py-3 text-sm text-white">${deposit.amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">${deposit.equivalentInUSDT}</td>
                  <td className="px-4 py-3">
                    <button
                      className="px-3 py-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium hover:bg-teal-500/20 transition-colors flex items-center gap-1"
                      onClick={() => setSelectedImage(getImageUrl(deposit.proofOfDeposit))}
                    >
                      <FaEye /> View
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        deposit.status === "Approved"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : deposit.status === "Pending"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(deposit.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium hover:bg-teal-500/20 transition-colors"
                        onClick={() => setSelectedDeposit(deposit)}
                      >
                        View
                      </button>
                      {deposit.status !== "Approved" && (
                        <button
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                          onClick={() => handleCancelDeposit(deposit._id)}
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

      {/* Modal for Deposit Details */}
      {selectedDeposit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-[rgba(26,29,41,0.95)] border border-[#2a2d3a] rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Deposit Details
              </h3>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setSelectedDeposit(null)}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Crypto Type</span>
                <p className="text-sm font-semibold text-white">{selectedDeposit.cryptoType}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Amount</span>
                <p className="text-sm font-semibold text-white">${selectedDeposit.amount}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Amount in USDT</span>
                <p className="text-sm font-semibold text-white">${selectedDeposit.equivalentInUSDT}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Status</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedDeposit.status === "Approved"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : selectedDeposit.status === "Pending"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {selectedDeposit.status}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[rgba(11,14,20,0.6)] rounded-lg border border-[#2a2d3a]">
                <span className="text-sm text-gray-400">Deposited At</span>
                <p className="text-sm text-gray-300">{new Date(selectedDeposit.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <button
              className="mt-6 w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
              onClick={() => setSelectedDeposit(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                className="absolute top-4 right-4 w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center z-10"
                onClick={() => setSelectedImage(null)}
              >
                <FaTimes />
              </button>
              <img src={selectedImage} alt="Deposit Proof" className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false, depositId: null })}
        onConfirm={confirmCancelDeposit}
        title="Cancel Deposit"
        message="Are you sure you want to cancel this deposit? This action cannot be undone."
        type="warning"
        confirmText="Yes, cancel it"
        cancelText="No, keep it"
      />
    </div>
  );
};

export default DepositHistory;
