import axios from "axios";

/ export const basisUrl = "https://www.api-exchange.bpay.africa";
// export const basisUrl = "http://localhost:5000";
// export const basisUrl = "https://xchangerate-banf.onrender.com"

// export const API_BASE_URL = "http://192.168.0.199:5000";

export const http = axios.create({
  baseURL: `${basisUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  // timeout: 60000,
});

// Request interceptors for API calls
http.interceptors.request.use(
  async (request) => {
    const token = sessionStorage.getItem("token");
    // console.log(token, 41)
    if (token) {
      request.headers["authorization"] = token;
    }
    // console.log("req",request, API_BASE_URL);

    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    // console.log("res", response);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log(error.response.data.message);
      // sessionStorage.removeItem("token");
      // window.location.href = "/login";
    }
    // console.log("err", error);

    return Promise.reject(error);
  }
);
