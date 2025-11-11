import { Routes, Route, useLocation } from "react-router-dom";
import React, { useState } from "react";
// import Profile from "./pages/ProfilePage/profile";
import Register from "./pages/RegistrationPage/registrationPage";
import LoginForm from "./pages/LoginPage/loginPage";
import Home from "./pages/Home/Home";
import ProfilePage from "./pages/ProfilePage/profile";
import NewsPage from "./pages/News/news";
import NewsDetail from "./components/NewsDetail/newsDetail";
import ChatComponent from "./components/Chat/ChatComponent";
import ChangePassword from "./components/ChangePassword/changePassword";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import Identity from './components/IdentityVerification/Identity';
import TradingPage from "./pages/TradingPage/TradingPage";
import HelpCenter from "./pages/HelpCenter/HelpCenter";
import TradeHistory from "./components/TradeHistory/TradeHistory";
import DepositHistory from "./components/DepositHistory/DepositHistory";
import WithdrawalHistory from "./components/WithdrawalHistory/WithdrawalHistory";
import LandingPage from "./pages/LandingPage/LandingPage";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService/TermsOfService";
import TabComponent from "./components/HistoryTab/TabComponent";
import Chart from "./components/ChartOfWatchlist/Chart";
import TradeTab from "./components/TradeTab/TradeTab";
import MarketPage from './pages/MarketPage/MarketPage';
import GoldChart from './components/GoldTrading/GoldChart';
import CryptoChartPage from "./components/RealtimeWatchlistChart/CryptoChartPage";
import AdvancedChart from "./components/AdvancedChart/AdvancedChart";
import BuySellChart from "./components/ChartOfWatchlist/BuySellChart";
import DemoTab from "./components/DemoTab/DemoTab";
import DemoBuySellChart from "./components/DemoBuySellChart/DemoBuySellChart";
import ForexChart from "./components/Chart/ForexChart";
import ModernTradingPage from "./components/ModernTrading/ModernTradingPage";
import DepositPage from "./pages/DepositPage/DepositPage";
import WithdrawalPage from "./pages/WithdrawalPage/WithdrawalPage";
import TransferPage from "./pages/TransferPage/TransferPage";
import ConvertPage from "./pages/ConvertPage/ConvertPage";
import SettingsPage from "./pages/SettingsPage/SettingsPage";
import NotificationPage from "./pages/NotificationPage/NotificationPage";
import NotificationDetailPage from "./pages/NotificationDetailPage/NotificationDetailPage";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  const [count, setCount] = useState(0);
  const location = useLocation();  // Get the current location

  // Array of paths where you don't want to display ChatComponent
  const noChatPaths = [
    "/login",
    "/register",
    "/resetPassword",
    "/privacy-policy",
    "/terms-of-service",
    "/help-center",
    "/",
    "/modern-trade"
  ];

  const shouldShowChat = !noChatPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resetPassword" element={<ForgotPassword />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/crypto/:cryptoId" element={<ProtectedRoute><BuySellChart /></ProtectedRoute>} />
        <Route path="/demo-crypto/:cryptoId" element={<ProtectedRoute><DemoBuySellChart /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/notifications/:id" element={<ProtectedRoute><NotificationDetailPage /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
        <Route path="/newsdetail/:id" element={<ProtectedRoute><NewsDetail /></ProtectedRoute>} />
        <Route path="/changePassword" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/real-name-authentication" element={<ProtectedRoute><Identity /></ProtectedRoute>} />
        <Route path="/trade" element={<ProtectedRoute><TradeTab /></ProtectedRoute>} />
        <Route path="/personal-center" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/trade-history" element={<ProtectedRoute><TradeHistory /></ProtectedRoute>} />
        <Route path="/deposit-history" element={<ProtectedRoute><DepositHistory /></ProtectedRoute>} />
        <Route path="/withdrawal-history" element={<ProtectedRoute><WithdrawalHistory /></ProtectedRoute>} />
        <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><WithdrawalPage /></ProtectedRoute>} />
        <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
        <Route path="/convert" element={<ProtectedRoute><ConvertPage /></ProtectedRoute>} />
        <Route path="/spot-history" element={<ProtectedRoute><TabComponent /></ProtectedRoute>} />
        <Route path="/market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
        <Route path="/demo" element={<ProtectedRoute><DemoTab /></ProtectedRoute>} />
        <Route path="/chart/:symbol" element={<ProtectedRoute><GoldChart /></ProtectedRoute>} />
        <Route path="/forex-chart/:symbol" element={<ProtectedRoute><ForexChart /></ProtectedRoute>} />
        <Route path="/watchlistchart/:cryptoId" element={<ProtectedRoute><AdvancedChart /></ProtectedRoute>} />
        <Route path="/modern-trade" element={<ProtectedRoute><ModernTradingPage /></ProtectedRoute>} />
      </Routes>

      {/* Conditionally render the ChatComponent */}
      {shouldShowChat && <ChatComponent />}
    </>
  );
}

export default App;
