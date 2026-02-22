import axios from 'axios';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Token automatically attach karne ke liye
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ya jahan bhi aapne save kiya ho
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Universal API Call Function
export const apiCall = async (method, url, data = null, params = null) => {
  try {
    const response = await apiClient({
      method,
      url,
      data,
      params,
    });
    return response.data;
  } catch (error) {
    // Yahan aap error handling logic (like logout on 401) daal sakte hain
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};