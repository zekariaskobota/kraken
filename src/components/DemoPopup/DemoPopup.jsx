import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import config from "../../config";
import Swal from "sweetalert2";

const DemoPopup = ({ cryptoData, isOpen, onClose, tradeType }) => {
  const navigate = useNavigate();
  const [tradeAmount, setTradeAmount] = useState("");
  const [expirationTime, setExpirationTime] = useState(null);
  const [highlightedButton, setHighlightedButton] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [selectedLabel, setSelectedLabel] = useState("");
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const [userWinLose, setUserWinLose] = useState("Off");
  const [userIdentityStatus, setUserIdentityStatus] = useState("Unidentified");
  const [isCounting, setIsCounting] = useState(false);
  const [countSeconds, setCountSeconds] = useState(0);
  const expirationOptions = [
    { label: "30s", percentage: 12, minTradeAmount: 500, maxTradeAmount: 5000 },
    { label: "60s", percentage: 15, minTradeAmount: 5000, maxTradeAmount: 20000 },
    { label: "90s", percentage: 18, minTradeAmount: 20000, maxTradeAmount: 50000 },
    { label: "120s", percentage: 21, minTradeAmount: 50000, maxTradeAmount: 90000 },
    { label: "180s", percentage: 24, minTradeAmount: 90000, maxTradeAmount: 200000 },
    { label: "360s", percentage: 27, minTradeAmount: 200000, maxTradeAmount: 1000000 },
  ];

  const estimatedIncome =
    tradeAmount && expirationTime
      ? (tradeAmount * (expirationTime / 100)).toFixed(2)
      : 0;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data); // Set user data in state
          setBalance(data.demoBalance || 0);
        } else {
          navigate("/"); // Redirect to login page
        }
      } catch (error) {
        navigate("/"); // Redirect to login page
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const email = decoded.email;

      fetch(`${config.BACKEND_URL}/api/auth/me/${email}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setBalance(data.balance);
          setUserId(decoded.id);
          setUserWinLose(data.winLose);
          setUserIdentityStatus(data.status);
        })
        .catch((error) => {
          // Error handling without console.log
        });
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0 ) {
      setIsCounting(false);
      submitTrade();
    }

    return () => clearTimeout(countdownRef.current);
  }, [countdown]);


  const resetTradeState = () => {
    setTradeAmount(0);
    setCountdown();
    setIsCounting(false);
    setIsAuthenticating(false);
  };


  const submitTrade = async () => {
    if (userIdentityStatus !== "Verified") {
      resetTradeState();

      Swal.fire({
        icon: "error",
        title: "Action Required",
        text: "Please verify your identity to trade!",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/real-name-authentication");
        }
      });

      return;
    }
    // Check for sufficient balance
    if (tradeAmount > balance) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient balance',
        text: 'Please deposit to trade!',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      resetTradeState();
      return;
    }

    const selectedExpiration = expirationOptions.find(
      (option) => option.label === selectedLabel
    );

    if (!selectedExpiration) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid expiration option selected.',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    if (tradeAmount < selectedExpiration.minTradeAmount) {
      Swal.fire({
        icon: 'error',
        title: `Trade amount must be at least $${selectedExpiration.minTradeAmount}`,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    if (tradeAmount > selectedExpiration.maxTradeAmount) {
      Swal.fire({
        icon: 'error',
        title: `Trade amount cannot exceed $${selectedExpiration.maxTradeAmount}`,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'User is not authenticated.',
          confirmButtonColor: '#f59e0b', // Tailwind amber-500
        });
        return;
      }
      let winLose = "Lose"; 
      if (userWinLose === "On") {
        winLose = "Win";
      } else {
        winLose = "Lose";;
      }

      const tradeData = {
        userId,
        selectedPair: cryptoData.name,
        currentPrice,
        tradeType,
        expirationTime:selectedLabel,
        tradeAmount,
        estimatedIncome,
        winLose
      };

      const response = await fetch(`${config.BACKEND_URL}/api/trades/trade-demo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tradeData),
      });

      if (response.ok) {
        let newBalance = 0;

const numericBalance = parseFloat(balance);
const numericEstimatedIncome = parseFloat(estimatedIncome);

if (userWinLose === "Off") {
  newBalance = numericBalance - numericEstimatedIncome - 0.5;
} else {
  newBalance = numericBalance + numericEstimatedIncome - 0.5;
}


        setBalance(newBalance);

        const updateBalanceResponse = await fetch(
          `${config.BACKEND_URL}/api/auth/update-demo-balance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, newBalance }),
          }
        );

        if (!updateBalanceResponse.ok) {
          // Error handling without console.log
        }

        Swal.fire({
          icon: 'success',
          title: 'Trade submitted successfully.',
          position: 'top',
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
        });

        resetTradeState();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to submit trade data.',
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error submitting trade data.',
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };
  const handleCountSecond = async () => {
    const selected = expirationOptions.find(
      (opt) => opt.label === selectedLabel
    );
    if (!selected) return;

    const seconds = parseInt(selected.label.replace("s", ""));
    setCountdown(seconds);
    setIsCounting(true);
    setCountSeconds(seconds);
  };

  const selectedExpiration = expirationOptions.find(
    (option) => option.percentage === expirationTime
  );
  

  return isOpen ? (
    <div 
      className="fixed inset-0 flex items-end justify-center z-[1000] bg-black/75 backdrop-blur-sm animate-[fadeIn_0.3s_ease]" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] border border-[#2a2d3a] rounded-t-3xl sm:rounded-t-[24px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-[slideUp_0.3s_ease] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]" 
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-300 mb-2">
          {cryptoData.name}{" "}
        </h1>
        <h2 className="text-xs sm:text-sm md:text-base mb-4 text-gray-400">
          ${cryptoData?.current_price ? cryptoData.current_price.toFixed(2) : cryptoData?.symbol}
        </h2>

        <input
          type="number"
          value={tradeAmount}
          onChange={(e) => setTradeAmount(e.target.value)}
          placeholder="enter amount here.."
          className="mt-2 w-full p-2 sm:p-3 rounded border border-gray-600 text-[10px] sm:text-xs"
          required
        />

        <div className="mt-3 sm:mt-4 gap-2 mb-2">
          <h3 className="text-green-400 mt-3 sm:mt-4 mb-3 sm:mb-4 select-expiration-time-txt text-[10px] sm:text-xs">
            Select expiration time
          </h3>
          {expirationOptions.map((option, index) => (
            <button
              key={index}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 mr-1 sm:mr-2 rounded mb-1.5 sm:mb-2 expiration-times text-[9px] sm:text-xs ${
                highlightedButton === index ? "bg-green-500" : "bg-gray-700"
              }`}
              onClick={() => {
                setExpirationTime(option.percentage);
                setSelectedLabel(option.label); // Store selected label
                setHighlightedButton(index);
              }}
            >
              {option.label} | {option.percentage}%
            </button>
          ))}
        </div>

        {selectedExpiration && (
          <div className="mt-3 sm:mt-4 bg-gray-700 rounded-lg p-2 sm:p-2.5">
            <div className="flex justify-between items-center text-white mb-2">
              <span className="text-[9px] sm:text-[10px]">Minimum Amount</span>
              <p className="text-[9px] sm:text-[10px]"> ${selectedExpiration.minTradeAmount}</p>
            </div>
            <div className="flex justify-between items-center text-white">
              <span className="text-[9px] sm:text-[10px]">Maximum Amount</span>
              <p className="text-[9px] sm:text-[10px]">${selectedExpiration.maxTradeAmount}</p>
            </div>
          </div>
        )}

        {isCounting && (
          <div className="mt-3 sm:mt-4 w-full">
            <div className="text-[10px] sm:text-xs text-green-500 mb-1">
              Confirming in {countdown} seconds...
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-blue-500 transition-all"
                style={{ width: `${(countdown / countSeconds) * 100}%` }}
              ></div>
            </div>
            <button
              className="mt-2 text-[9px] sm:text-xs text-red-500 hover:underline"
              onClick={resetTradeState}
            >
              Cancel
            </button>
          </div>
        )}

        <p className="mt-3 sm:mt-4 estimated-income text-[10px] sm:text-xs">
          Estimated Income: ${estimatedIncome}
        </p>

        <div className="flex justify-center mt-4 sm:mt-6 gap-3 sm:gap-6">
          <button
            className="bg-green-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-[10px] sm:text-xs"
            onClick={handleCountSecond}
            style={{ width: "50%" }}
            disabled={loading} // Disable when loading or authenticating
          >
            {tradeType}
          </button>
          <button
            className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-[10px] sm:text-xs"
            onClick={onClose}
            style={{ width: "50%" }}
          >
            Cancel
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  ) : null;
};

export default DemoPopup;