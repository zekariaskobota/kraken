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
import TopUpRewards from "./components/TopUp/topUp";
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
    "/",
    "/modern-trade"
  ];

  const shouldShowChat = !noChatPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/crypto/:cryptoId" element={<BuySellChart />} />
        <Route path="/demo-crypto/:cryptoId" element={<DemoBuySellChart />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/newsdetail/:id" element={<NewsDetail />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        <Route path="/resetPassword" element={<ForgotPassword />} />
        <Route path="/real-name-authentication" element={<Identity />} />
        <Route path="/trade" element={<TradeTab />} />
        <Route path="/topupRewards" element={<TopUpRewards />} />
        <Route path="/personal-center" element={<ProfilePage />} />
        <Route path="/trade-history" element={<TradeHistory />} />
        <Route path="/deposit-history" element={<DepositHistory />} />
        <Route path="/withdrawal-history" element={<WithdrawalHistory />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/spot-history" element={<TabComponent />} />
        <Route path="/market" element={<MarketPage/>} />
        <Route path="/demo" element={<DemoTab/>} />
        <Route path="/chart/:symbol" element={<GoldChart />} />
        <Route path="/forex-chart/:symbol" element={<ForexChart />} />
        <Route path="/watchlistchart/:cryptoId" element={<AdvancedChart />} />
        <Route path="/modern-trade" element={<ModernTradingPage />} />
      </Routes>

      {/* Conditionally render the ChatComponent */}
      {shouldShowChat && <ChatComponent />}
    </>
  );
}

export default App;
