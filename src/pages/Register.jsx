import  { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import axios from 'axios';
import { basisUrl } from '@/utils/api';
import { adminEmails } from './Login';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // To store success or error message
  const navigate = useNavigate();

  // Function to handle the form submission
  const onSubmit = async (data) => {
    setLoading(true); // Show loading state
    setNotification(null); // Clear previous notifications

    try {
      // Send registration data to the backend
      const response = await axios.post(`${basisUrl}/api/users/register`, {
        email: data.email,
        username: data.username,
        password: data.password,
      });
      const isAdmin = adminEmails.includes(data?.email?.toLowerCase());
      localStorage.setItem("isAdmin", isAdmin);
      localStorage.setItem("token", response.data.token);
      // If registration is successful
      setNotification({ type: 'success', message: 'Registration successful!' });
      navigate(isAdmin ? "/admin/rates" : "/");
    } catch (error) {
      // Handle registration error
      setNotification({ type: 'error', message: error.response?.data?.message || 'Registration failed!' });
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="container mx-auto max-w-sm py-10">
      <h1 className="text-2xl font-bold mb-5">Register</h1>

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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Register;
