export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api-kraken-3y6c.onrender.com';

export const API_ENDPOINTS = {
  // Auth
  auth: {
    profile: '/api/auth/profile',
    login: '/api/auth/login',
    register: '/api/auth/register',
    googleAuth: '/api/auth/google-auth',
    changePassword: '/api/auth/change-password',
    verifyFundPassword: '/api/auth/verify-fund-password',
    me: '/api/auth/me',
  },
  // Trades
  trades: {
    allTrades: '/api/trades/alltrades',
    createTrade: '/api/trades/trade',
    createDemoTrade: '/api/trades/trade-demo',
    cancelTrade: (id) => `/api/trades/cancel/${id}`,
  },
  // Deposits
  deposits: {
    userDeposits: '/api/deposits/user-deposits',
    createDeposit: '/api/deposits/deposit',
    cancelDeposit: (id) => `/api/deposits/cancel/${id}`,
  },
  // Withdrawals
  withdrawals: {
    allWithdrawals: '/api/withdrawals/all-my-Withdrawals',
    withdraw: '/api/withdrawals/withdraw',
    cancelWithdrawal: (id) => `/api/withdrawals/cancel/${id}`,
  },
  // Identity
  identity: {
    status: '/api/identity/identity-status',
    verify: '/api/identity/verify-identity',
  },
  // Admin
  admin: {
    allAddresses: '/api/admin/alladdresses',
  },
};

// Legacy support - keep for backward compatibility with apiService.js
const API_CONFIG = {
  BASE_URL: BACKEND_URL,
  ENDPOINTS: {
    AUTH: {
      PROFILE: API_ENDPOINTS.auth.profile,
      LOGIN: API_ENDPOINTS.auth.login,
      REGISTER: API_ENDPOINTS.auth.register,
      GOOGLE_AUTH: API_ENDPOINTS.auth.googleAuth,
      CHANGE_PASSWORD: API_ENDPOINTS.auth.changePassword,
      VERIFY_FUND_PASSWORD: API_ENDPOINTS.auth.verifyFundPassword,
    },
    TRADES: {
      ALL_TRADES: API_ENDPOINTS.trades.allTrades,
      CREATE_TRADE: API_ENDPOINTS.trades.createTrade,
      CREATE_DEMO_TRADE: API_ENDPOINTS.trades.createDemoTrade,
      CANCEL_TRADE: API_ENDPOINTS.trades.cancelTrade,
    },
    DEPOSITS: {
      USER_DEPOSITS: API_ENDPOINTS.deposits.userDeposits,
      CREATE_DEPOSIT: API_ENDPOINTS.deposits.createDeposit,
      CANCEL_DEPOSIT: API_ENDPOINTS.deposits.cancelDeposit,
    },
    WITHDRAWALS: {
      ALL_WITHDRAWALS: API_ENDPOINTS.withdrawals.allWithdrawals,
      WITHDRAW: API_ENDPOINTS.withdrawals.withdraw,
      CANCEL_WITHDRAWAL: API_ENDPOINTS.withdrawals.cancelWithdrawal,
    },
    IDENTITY: {
      STATUS: API_ENDPOINTS.identity.status,
      VERIFY: API_ENDPOINTS.identity.verify,
    },
    ADMIN: {
      ALL_ADDRESSES: API_ENDPOINTS.admin.allAddresses,
    },
  },
};

export default API_CONFIG;
