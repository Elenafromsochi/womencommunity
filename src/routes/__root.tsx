import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Bell, User } from "lucide-react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useAppStore } from "../lib/store";
import { cn } from "../lib/utils";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "Женское общество" },
      { name: "description", content: "Закрытое женское сообщество для роста, поддержки и общения" },
      { name: "author", content: "Женское общество" },
      { property: "og:title", content: "Женское общество" },
      { property: "og:description", content: "Закрытое женское сообщество для роста, поддержки и общения" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mobile-shell">
        <div className="min-h-[100dvh] flex flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto no-scrollbar">
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "1.5rem",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        }}
      />
    </QueryClientProvider>
  );
}

function AppHeader() {
  const role = useAppStore((s) => s.role);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const showHeader = ![
    "/onboarding",
    "/mentor",
    "/curator",
    "/admin",
  ].includes(path);

  if (!showHeader) return null;

  return (
    <header className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between z-10">
      <Link to="/" className="flex flex-col">
        <span className="font-[Lora] italic text-lg tracking-tight text-primary font-semibold">
          ЖО.
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          className="relative size-9 flex items-center justify-center rounded-full bg-card ring-1 ring-border/40"
        >
          <Bell className="size-[18px] text-foreground/70" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full ring-2 ring-background" />
        </Link>
        <Link
          to="/profile"
          className="size-9 rounded-full bg-cream ring-1 ring-border/40 overflow-hidden flex items-center justify-center"
        >
          <User className="size-[18px] text-foreground/50" />
        </Link>
        {role !== "member" && (
          <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider font-medium">
            {role === "mentor" ? "Наставник" : role === "curator" ? "Куратор" : "Админ"}
          </span>
        )}
      </div>
    </header>
  );
}

function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const role = useAppStore((s) => s.role);

  if (role !== "member") return null;

  const tabs = [
    { to: "/", label: "Главная", exact: true },
    { to: "/topics", label: "Темы", exact: true },
    { to: "/mentors", label: "Наставники", exact: true },
    { to: "/events", label: "Мероприятия", exact: true },
    { to: "/community", label: "Сообщество", exact: true },
  ];

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.exact) return path === tab.to;
    return path.startsWith(tab.to);
  };

  return (
    <nav className="shrink-0 h-[72px] px-2 pb-2">
      <div className="h-full bg-card/80 backdrop-blur-xl rounded-full ring-1 ring-border/40 shadow-lg shadow-primary/5 flex items-center justify-around px-1">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center gap-1 py-2 px-2 min-w-[52px]"
            >
              <div
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  active ? "bg-primary scale-125" : "bg-transparent border border-foreground/20"
                )}
              />
              <span
                className={cn(
                  "text-[9px] uppercase tracking-widest font-medium transition-colors",
                  active ? "text-primary" : "text-foreground/40"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
