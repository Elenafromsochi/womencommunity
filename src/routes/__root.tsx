import { useEffect } from "react";
import {
  Outlet,
  Link,
  createRootRoute,
  useRouterState,
  useNavigate,
  HeadContent,
} from "@tanstack/react-router";

import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { AuthScreen } from "../components/AuthScreen";
import { Toaster } from "../components/ui/sonner";
import { useAuth } from "../lib/auth";
import { useAppStore } from "../lib/store";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Женское общество" },
      { name: "description", content: "Закрытое женское сообщество" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function Loader() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <span className="size-8 rounded-full border-2 border-border border-t-primary animate-spin" />
    </div>
  );
}

// Фон приложения зависит от роли — чтобы режимы не путались.
const ROLE_BG: Record<string, string | undefined> = {
  member: undefined, // участница — обычный светлый фон
  mentor: "hsl(38 44% 92%)", // эксперт — бежевый
  curator: "hsl(150 26% 92%)", // куратор — мягкий шалфейный
  admin: "hsl(280 24% 94%)", // администратор — лавандовый
};

function RootComponent() {
  const { session, loading } = useAuth();
  const hydrated = useAppStore((s) => s.hydrated);
  const role = useAppStore((s) => s.role);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const { location } = useRouterState();
  const navigate = useNavigate();

  // Новую участницу (без пройденной диагностики) ведём на онбординг.
  useEffect(() => {
    if (
      session &&
      hydrated &&
      !onboardingComplete &&
      !location.pathname.startsWith("/onboarding")
    ) {
      navigate({ to: "/onboarding" });
    }
  }, [session, hydrated, onboardingComplete, location.pathname, navigate]);

  if (loading) return <Loader />;
  if (!session) return <AuthScreen />;
  if (!hydrated) return <Loader />;

  const hideChrome = location.pathname.startsWith("/onboarding");

  return (
    <>
      <HeadContent />
      <div
        className="mobile-shell flex flex-col"
        style={ROLE_BG[role] ? { background: ROLE_BG[role] } : undefined}
      >
        {!hideChrome && <AppHeader />}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
        {!hideChrome && <BottomNav />}
        <Toaster />
      </div>
    </>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Похоже, такой страницы нет или она была перемещена.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Страница не загрузилась
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Что-то пошло не так. Попробуйте обновить или вернуться на главную.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Обновить
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}
