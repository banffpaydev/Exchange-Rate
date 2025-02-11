import axios from "axios";
import { http } from "./config";
// import dotenv from 'dotenv';
// dotenv.config();

export const basisUrl = "https://www.api-exchange.bpay.africa";
// export const basisUrl = "http://localhost:5000";
// export const basisUrl = "https://xchangerate-banf.onrender.com"

// Base URL for your backend API  process.env.REACT_APP_API_BASE_URL ||  'https://xchangerate-banf.onrender.com' || ''http://localhost:5000'
const BASE_URL = `${basisUrl}/api/rates`; // Make sure to set this in your .env file

// Helper function to handle all POST requests
const postRequest = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, config);
    return response.data;
  } catch (error) {
    console.error(`POST request to ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

// Helper function to handle all GET requests
const getRequest = async (endpoint, config = {}) => {
  try {
    const response = await http.get(`/rates/${endpoint}`, config);
    return response.data;
  } catch (error) {
    console.error(`GET request to ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

export const getRates = () => getRequest("/rates");
export const fetchDbRates = (pair, fromDate, toDate, page) =>
  getRequest(
    `/filtered-dbrates?pair=${pair}&fromDate=${fromDate}&toDate=${toDate}&page=${
      page ?? 1
    }`
  );
export const getUser = async () => {
  try {
    const response = await http.get(`/users/user`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Example of exporting various API functions
export const createUser = (userData) => postRequest("/users", userData);

export const loginUser = (credentials) =>
  postRequest("/auth/login", credentials);

export const fetchUserProfile = (userId) => getRequest(`/users/${userId}`);

export const updateUserProfile = (userId, profileData) =>
  postRequest(`/users/${userId}/update`, profileData);

export const fetchPosts = () => getRequest("/posts");

export const createPost = (postData) => postRequest("/posts", postData);

export const deletePost = (postId) => postRequest(`/posts/${postId}/delete`);

export const fetchPostById = (postId) => getRequest(`/posts/${postId}`);

export const fetchComments = (postId) =>
  getRequest(`/posts/${postId}/comments`);

export const createComment = (postId, commentData) =>
  postRequest(`/posts/${postId}/comments`, commentData);
