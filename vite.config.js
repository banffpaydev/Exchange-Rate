import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: "::",
    port: "3004",
    cors: {
      origin: "https://exchange.bpay.africa", // Allow requests from this origin
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow specific methods
    },
    proxy: {
      // Proxy requests to the host exchange.bpay.africa
      "/api": {
        target: "https://exchange.bpay.africa",
        changeOrigin: true,
        secure: false, // Set to true if you're using HTTPS with a valid certificate
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
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