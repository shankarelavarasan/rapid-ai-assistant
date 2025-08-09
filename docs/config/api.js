// API Configuration for Rapid AI Assistant
export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:9999',
    wsUrl: 'ws://localhost:9999',
  },
  production: {
    baseUrl: 'https://rapid-ai-assistant.onrender.com',
    wsUrl: 'wss://rapid-ai-assistant.onrender.com',
  },
  staging: {
    baseUrl: 'https://rapid-ai-assistant-git-main-shankarelavarasan.vercel.app',
    wsUrl: 'wss://rapid-ai-assistant-git-main-shankarelavarasan.vercel.app',
  }
};

// Environment detection
export const getApiConfig = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return API_CONFIG.development;
  } else if (hostname.includes('vercel.app')) {
    return API_CONFIG.production;
  } else {
    return API_CONFIG.production; // Default to production
  }
};