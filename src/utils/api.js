import axios from 'axios';
// import dotenv from 'dotenv';
// dotenv.config();

export const basisUrl = "https://www.api-exchange.bpay.africa";
// export const basisUrl = "http://localhost:5000";
// export const basisUrl = "https://xchangerate-banf.onrender.com"


const bases =  'http://localhost:5000';//process.env.REACT_APP_API_URL ||
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
      // Retrieve the token from session storage
      const token = sessionStorage.getItem('token');

      // Add the token to the headers if it exists
      const updatedConfig = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      };
    const response = await axios.get(`${BASE_URL}${endpoint}`, updatedConfig);
    return response.data;
  } catch (error) {
    console.error(`GET request to ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

const getGeneralRequest = async (endpoint, config = {}) => {
  try {
    // Retrieve the token from session storage
    const token = sessionStorage.getItem('token');

    // Add the token to the headers if it exists
    const updatedConfig = {
      ...config,
      headers: {
        ...config.headers,
        authorization: token ? `Bearer ${token}` : undefined,
      },
    };

    const response = await axios.get(`${basisUrl}/api${endpoint}`, updatedConfig);
    return response.data;
  } catch (error) {
    console.error(`GET request to ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};


export const getRates = () => getRequest('/rates');
export const fetchDbRates = () => getRequest('/dbrates');
export const getUser = () => getGeneralRequest('/users/user');

// Example of exporting various API functions
export const createUser = (userData) => postRequest('/users', userData);

export const loginUser = (credentials) => postRequest('/auth/login', credentials);

export const fetchUserProfile = (userId) => getRequest(`/users/${userId}`);

export const updateUserProfile = (userId, profileData) => postRequest(`/users/${userId}/update`, profileData);

export const fetchPosts = () => getRequest('/posts');

export const createPost = (postData) => postRequest('/posts', postData);

export const deletePost = (postId) => postRequest(`/posts/${postId}/delete`);

export const fetchPostById = (postId) => getRequest(`/posts/${postId}`);

export const fetchComments = (postId) => getRequest(`/posts/${postId}/comments`);

export const createComment = (postId, commentData) => postRequest(`/posts/${postId}/comments`, commentData);
