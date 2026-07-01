import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// Чистый Vite + React + TanStack Router (client SPA).
// Без TanStack Start / SSR / nitro и без зависимостей Lovable.
// Сборка даёт статику в dist/ — кладётся на любой хостинг (идеально для PWA/RuStore).
export default defineConfig({
  // Базовый путь. Для корневого хостинга = "/", для GitHub Pages (подпапка
  // /womencommunity/) задаётся через переменную BASE_PATH в workflow сборки.
  base: process.env.BASE_PATH || "/",
  plugins: [
    tsConfigPaths(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: { port: 8080 },
  preview: { port: 8080 },
});
