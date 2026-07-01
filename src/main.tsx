import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { AuthProvider } from "./lib/auth";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

// Базовый путь роутера синхронизирован с base сборки (Vite подставляет BASE_URL).
// На корневом хостинге BASE_URL = "/", на GitHub Pages = "/womencommunity/".
const basepath =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, "");

const router = createRouter({
  routeTree,
  basepath,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StrictMode>,
  );
}
