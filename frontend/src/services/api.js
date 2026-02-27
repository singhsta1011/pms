import axios from "axios";

/* =====================================================
   ⭐ BASE URL
===================================================== */
const BASE_URL = "http://localhost:3000";

/* =====================================================
   🔐 AUTH API (LOGIN / SIGNUP ONLY)
===================================================== */
export const authApi = axios.create({
  baseURL: `${BASE_URL}/auth`
});

/* =====================================================
   🏨 ADMIN PMS API (TOKEN REQUIRED)
===================================================== */
export const api = axios.create({
  baseURL: `${BASE_URL}/admin`
});

/* =====================================================
   ⭐ AUTO TOKEN ATTACH
===================================================== */
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================================================
   ⭐ AUTO 401 HANDLER (SMART MULTI PORTAL)
===================================================== */
api.interceptors.response.use(
  res => res,
  (error)=>{

    if(error.response?.status === 401){

      const role = localStorage.getItem("role");

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("hotelId");

      if(role === "SUPER_ADMIN"){
        window.location.href="/superadmin/login";
      }
      else if(role === "HOTEL_ADMIN"){
        window.location.href="/admin/login";
      }
      else{
        window.location.href="/user/login";
      }
    }

    return Promise.reject(error);
  }
);