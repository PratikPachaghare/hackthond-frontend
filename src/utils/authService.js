import { apiCall } from './apiClient';
import { ENDPOINTS } from './endpoints';

export const loginUser = async (credentials) => {
  try {
    const data = await apiCall('POST', ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Login success par token save karein
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  } catch (err) {
    throw err;
  }
};

export const getUserProfile = async () => {
  return await apiCall('GET', ENDPOINTS.USER.PROFILE);
};