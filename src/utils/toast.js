import { toast } from 'react-toastify';

const toastConfig = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'dark',
  style: {
    background: 'linear-gradient(135deg, #0b0e14 0%, #1a1d29 100%)',
    border: '1px solid #2a2d3a',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  }
};

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      ...toastConfig,
      ...options,
      style: {
        ...toastConfig.style,
        borderLeft: '4px solid #14b8a6',
      }
    });
  },
  
  error: (message, options = {}) => {
    toast.error(message, {
      ...toastConfig,
      ...options,
      style: {
        ...toastConfig.style,
        borderLeft: '4px solid #ef4444',
      }
    });
  },
  
  warning: (message, options = {}) => {
    toast.warning(message, {
      ...toastConfig,
      ...options,
      style: {
        ...toastConfig.style,
        borderLeft: '4px solid #f59e0b',
      }
    });
  },
  
  info: (message, options = {}) => {
    toast.info(message, {
      ...toastConfig,
      ...options,
      style: {
        ...toastConfig.style,
        borderLeft: '4px solid #3b82f6',
      }
    });
  },
};

export default showToast;

