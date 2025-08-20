
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        overlay: resolve(__dirname, "src/overlay.html"),
      },
    },
    outDir: "dist",
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
