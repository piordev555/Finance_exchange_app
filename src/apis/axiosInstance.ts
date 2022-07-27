import axios from "axios";


const instance = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api/v1`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-SECRET": process.env.REACT_APP_X_REQUEST_SECRET,
  },
});

instance.interceptors.request.use((req) => {
  const token = localStorage.getItem("user:key");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  }
  return req;
});

instance.interceptors.response.use(
  (response) => {
    return Promise.resolve(response.data || response);
  },
  (error) => {
    const response = error.response || {};
    return Promise.reject(response);
  }
);

export default instance;
