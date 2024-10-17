import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import axios from 'axios';

const Login = () => {
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // To store success or error message
  const navigate = useNavigate(); // Initialize useNavigate for routing

  // Function to handle the form submission
  const onSubmit = async (data) => {
    setLoading(true); // Show loading state
    setNotification(null); // Clear previous notifications

    try {
      // Send login data to the backend
      const response = await axios.post('https://xchangerate-banf.onrender.com/api/users/login', {
        email: data.email,
        password: data.password,
      });

      // Handle success
      setNotification({ type: 'success', message: 'Login successful! Redirecting...' });

      // Save the token in localStorage
      localStorage.setItem('token', response.data.token);

      // Redirect to the home page after 3 seconds
      setTimeout(() => {
        navigate('/'); // Redirect to home page
      }, 3000);
    } catch (error) {
      // Handle login error
      setNotification({ type: 'error', message: error.response?.data?.message || 'Login failed!' });
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="container mx-auto max-w-sm py-10">
      <h1 className="text-2xl font-bold mb-5">Login</h1>

      {/* Show notifications for success or error */}
      {notification && (
        <div
          className={`p-4 mb-4 text-sm rounded ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Login;
