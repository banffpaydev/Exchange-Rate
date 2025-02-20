import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import { useStore } from "../../store/store";
import { adminUsers } from "./AdminRates copy";

const Login = () => {
  const form = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility

  const navigate = useNavigate();
  const { setUser } = useStore();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post(`${basisUrl}/api/users/login`, {
        email: data.email,
        password: data.password,
      });

      setUser(response.data.data.user);
      sessionStorage.setItem("token", response.data.data.token);

      toast.success("Login successful! Redirecting...");

      // Redirect after successful login
      setTimeout(() => {
        navigate(
          adminUsers.includes(response.data?.data?.user.type)
            ? "/admin/rates"
            : "/"
        );
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-sm py-10">
      <h1 className="text-2xl font-bold mb-5">Login</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Login;
