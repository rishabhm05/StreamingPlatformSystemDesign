import axios  from "axios";
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000', // Replace with your backend base URL
    withCredentials: true, // Include cookies in requests (if using HTTP-only cookies)
  });

axiosInstance.interceptors.request.use(
    config =>{
        // Add the access token to headers if it exists
        const token = localStorage.getItem('token');
        console.log("called",token)
        if (token) {
          config.headers['x-auth'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        window.location.href ="/";
        return Promise.reject(error);
      }
);
export default axiosInstance;