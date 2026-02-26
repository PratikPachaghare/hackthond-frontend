export const API_BASE_URL = "http://localhost:8000/api"; // Production mein domain change karein

export const ENDPOINTS = {
  // 1. User & Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/users/login`,
    REGISTER: `${API_BASE_URL}/users/register`,
    UPDATE_LOCATION: `${API_BASE_URL}/users/update-location`, // User/Worker live tracking ke liye
  },

  // 2. Admin Specific Endpoints
  ADMIN: {
    GET_CITY_BINS: `${API_BASE_URL}/admin/stats`, // Amravati city ke saare bins
    GET_ALL_WORKERS: `${API_BASE_URL}/admin/workers`, // Dashboard list ke liye
    DASHBOARD_STATS: `${API_BASE_URL}/admin/stats`,
    HOSTPOT_STATS: `${API_BASE_URL}/admin/hotspots`,
  },

  // 3. Worker Specific Endpoints (ML Model Integrated)
  WORKER: {
    GET_OPTIMIZED_TASKS: `${API_BASE_URL}/worker/PredictedList`, // Flask model se filtered data lene ke liye
    GET_ALL_WORKERS: `${API_BASE_URL}/worker/getAllWorkers`, // Flask model se filtered data lene ke liye
    GET_BIN_ANALYTICS: (binId) => `${API_BASE_URL}/worker/getBinAnalytics/${binId}`, // Flask model se filtered data lene ke liye
    COMPLETE_TASK: `${API_BASE_URL}/worker/complete-task`,
    GET_CITY_BINS: `${API_BASE_URL}/worker/dashboard-stats`,
    GET_WORKER_TOKEN: `${API_BASE_URL}/worker/getWorkerFromToken`,
  },

  // 4. Dustbin Management
  DUSTBIN: {
    MAP_DUSTBINS: `${API_BASE_URL}/dustbins/map`, // Map view ke liye saare bins
    COLLECTED_BIN: `${API_BASE_URL}/dustbins/update/collectBin`, // Map view ke liye saare bins
    ADD_SINGLE: `${API_BASE_URL}/dustbins/add`,
    ADD_BULK: `${API_BASE_URL}/dustbins/add/bulk`, // Multiple bins ek saath add karne ke liye
    DUSTBINAREA: `${API_BASE_URL}/dustbins/getDustbinArea`,
 // Multiple bins ek saath add karne ke liye
    GET_DETAILS: (id) => `${API_BASE_URL}/dustbins/${id}`,
    DELETE: (id) => `${API_BASE_URL}/dustbins/${id}`,
  },

  // 5. Hardware/IoT Integration
  HARDWARE: {
    UPDATE_LEVEL: `${API_BASE_URL}/dustbins/update-level`, // Sensor data update logic
  }
};