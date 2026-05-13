/// <reference types="vitest" />
import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default mergeConfig(
  defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            recharts: ["recharts"],
            query: ["@tanstack/react-query"],
            zustand: ["zustand"],
          },
        },
      },
    },
  }),
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
    },
  } as any)
);