import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/businesses": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/orders": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});