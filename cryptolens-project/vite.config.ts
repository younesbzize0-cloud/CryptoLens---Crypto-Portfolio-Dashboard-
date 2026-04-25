import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Tree-shake heavy libs into separate chunks
        manualChunks: {
          recharts: ["recharts"],
          query: ["@tanstack/react-query"],
          zustand: ["zustand"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});