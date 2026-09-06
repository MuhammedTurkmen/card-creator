import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  const isElectron = mode === "electron";

  return {
    plugins: [react()],
    root: "src/renderer",
    base: isElectron ? "./" : "/card-creator/", // GitHub Pages repo adına göre değiştir
    build: {
      outDir: "../../dist",
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: path.resolve(__dirname, "src/renderer/index.html"),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/renderer"),
        "@shared": path.resolve(__dirname, "src/shared"),
      },
    },
  };
});
