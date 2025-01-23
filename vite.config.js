import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/

export default defineConfig({
  server: {
		cors: {
			origin: ['https://exchange.bpay.africa', 'http://localhost:3004'],
			methods: ['GET', 'POST', 'PUT', "DELETE"],
			allowedHeaders: ['Content-Type']
		},
		allowedHosts: ['exchange.bpay.africa'] //added this
	},
  preview: {
		cors: {
			origin: ['https://exchange.bpay.africa', 'http://localhost:3004'],
			methods: ['GET', 'POST', 'PUT', "DELETE"],
			allowedHeaders: ['Content-Type']
		},
		allowedHosts: ['exchange.bpay.africa'] //added this
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
