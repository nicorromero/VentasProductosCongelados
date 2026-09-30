import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: automatically logout if token is expired
            // removeToken();
            // window.location.href = '/admin-login'; 
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
