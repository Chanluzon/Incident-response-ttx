// API configuration
// Set VITE_API_URL in .env file or defaults to current hostname:5000
const getDefaultApiUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || getDefaultApiUrl();

// Helper to build API URLs
export const apiUrl = (path) => `${API_BASE_URL}${path}`;
