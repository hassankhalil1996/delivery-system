import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://localhost:3000",
      "/businesses": "http://localhost:3000",
      "/couriers": "http://localhost:3000",
      "/orders": "http://localhost:3000",
      "/pricing": "http://localhost:3000",
    },
  },
});