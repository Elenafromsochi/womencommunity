import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, CalendarDays, MessagesSquare, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Главная", Icon: Home },
  { to: "/topics", label: "Темы", Icon: Sparkles },
  { to: "/events", label: "События", Icon: CalendarDays },
  { to: "/community", label: "Чат", Icon: MessagesSquare },
  { to: "/profile", label: "Профиль", Icon: User },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  const path = location.pathname;

  const isActive = (to: string) =>
    to === "/" ? path === "/" : path === to || path.startsWith(to + "/");

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 pt-2 pb-3 safe-bottom">
        {tabs.map(({ to, label, Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors"
            >
              <div
                className={`size-9 rounded-full flex items-center justify-center transition-all ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
