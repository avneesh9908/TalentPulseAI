import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Pinned + strict: if 5173 is taken, fail loudly instead of drifting to 5174.
    // A drifted port is an origin the backend's CORS list does not know about,
    // which shows up as an unexplained network error on login.
    port: 5173,
    strictPort: true,
  },
});
