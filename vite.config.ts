import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: '/tilt-features/',
  define: {
    __BASE_URL__: JSON.stringify('/tilt-features/'),
    __GSHEET_API_URL__: JSON.stringify(process.env.VITE_GSHEET_API_URL || ''),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
