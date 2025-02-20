import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: "3004",
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: "5000", // Force Vite preview to use port 3004
    allowedHosts: "*",
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
console.log("vite.config.js",  defineConfig({
  server: {
    host: "0.0.0.0",
    port: "3004",
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: "5000", // Force Vite preview to use port 3004
    allowedHosts: "*",
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
}));