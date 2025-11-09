import API_CONFIG from './apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const getAuthHeadersFormData = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

// Auth API
export const authAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  googleAuth: async (token) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE_AUTH}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });
    return handleResponse(response);
  },

  changePassword: async (passwordData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  verifyFundPassword: async (fundPassword) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_FUND_PASSWORD}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fundPassword }),
    });
    return handleResponse(response);
  },
};

// Trades API
export const tradesAPI = {
  getAllTrades: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRADES.ALL_TRADES}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createTrade: async (tradeData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRADES.CREATE_TRADE}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tradeData),
    });
    return handleResponse(response);
  },

  createDemoTrade: async (tradeData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRADES.CREATE_DEMO_TRADE}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tradeData),
    });
    return handleResponse(response);
  },

  cancelTrade: async (tradeId) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRADES.CANCEL_TRADE(tradeId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Deposits API
export const depositsAPI = {
  getUserDeposits: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPOSITS.USER_DEPOSITS}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createDeposit: async (formData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPOSITS.CREATE_DEPOSIT}`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData,
    });
    return handleResponse(response);
  },

  cancelDeposit: async (depositId) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEPOSITS.CANCEL_DEPOSIT(depositId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Withdrawals API
export const withdrawalsAPI = {
  getAllWithdrawals: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WITHDRAWALS.ALL_WITHDRAWALS}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  withdraw: async (withdrawalData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WITHDRAWALS.WITHDRAW}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(withdrawalData),
    });
    return handleResponse(response);
  },

  cancelWithdrawal: async (withdrawalId) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WITHDRAWALS.CANCEL_WITHDRAWAL(withdrawalId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Identity API
export const identityAPI = {
  getStatus: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IDENTITY.STATUS}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  verifyIdentity: async (formData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IDENTITY.VERIFY}`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData,
    });
    return handleResponse(response);
  },
};

// Admin API
export const adminAPI = {
  getAllAddresses: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.ALL_ADDRESSES}`);
    return handleResponse(response);
  },
};

