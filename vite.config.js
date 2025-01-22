import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path"; 

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: "3004",
    allowedHosts: ['exchange.bpay.africa'],
  },
  preview: {
    host: "0.0.0.0",
    port: "3004", // Set your desired preview port here
    // allowedHosts: ['exchange.bpay.africa'],
    headers: {
      "Access-Control-Allow-Origin": "*", // Allow all origins
    },
    allowedHosts: "all",
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "lib",
        replacement: resolve(__dirname, "lib"),
      },
    ],
  },
});