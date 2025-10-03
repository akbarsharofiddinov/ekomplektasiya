import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import * as path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  server: {
    proxy: {
      "/api": {
        target: "https://ekomplektasiya.uz",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(/^\/api/, "/ekomplektasiya_backend"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@UI": path.resolve(__dirname, "./src/components/UI"),
      "@services": path.resolve(__dirname, "./src/services"),
      buffer: "buffer", // polyfill uchun
    },
  },
  optimizeDeps: {
    include: ["buffer"], // polyfill uchun
    exclude: ["html-docx-js"],
  },
  build: {
    commonjsOptions: {
      include: [/html-docx-js/, /node_modules/],
    },
  },
});
