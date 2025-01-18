import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { basisUrl } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";

const Register = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // To store success or error message
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const navigate = useNavigate();
  const { setUser } = useStore();

  // Function to handle the form submission
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setNotification({ type: "error", message: "Passwords do not match!" });
      return;
    }

    setLoading(true); // Show loading state
    setNotification(null); // Clear previous notifications

    try {
      // Send registration data to the backend
      const response = await axios.post(`${basisUrl}/api/users/register`, {
        email: data.email,
        password: data.password,
      });

      setUser(response.data.data.user);
      sessionStorage.setItem("token", response.data.data.token);
      // If registration is successful
      setNotification({ type: "success", message: "Registration successful!" });
      // Redirect after successful login
      setTimeout(() => {
        navigate(
          response.data?.data?.user.type === "admin" ? "/admin/rates" : "/"
        );
      }, 1000);
    } catch (error) {
      // Handle registration error
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Registration failed!",
      });
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
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
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
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            rules={{ required: "Please confirm your password" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Register;
