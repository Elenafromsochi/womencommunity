import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Sparkles,
  CalendarDays,
  MessagesSquare,
  User,
  LayoutGrid,
  FileText,
  Calendar,
} from "lucide-react";
import { useAppStore } from "../lib/store";

const memberTabs = [
  { to: "/", label: "Главная", Icon: Home },
  { to: "/topics", label: "Темы", Icon: Sparkles },
  { to: "/events", label: "События", Icon: CalendarDays },
  { to: "/community", label: "Чат", Icon: MessagesSquare },
  { to: "/profile", label: "Профиль", Icon: User },
] as const;

// Навигация наставника — его собственное пространство.
const expertTabs = [
  { to: "/studio", label: "Главная", Icon: LayoutGrid, hash: "" },
  { to: "/mentor", label: "Материалы", Icon: FileText, hash: "material" },
  { to: "/mentor", label: "События", Icon: Calendar, hash: "event" },
  { to: "/inbox", label: "Чат", Icon: MessagesSquare, hash: "" },
  { to: "/profile", label: "Профиль", Icon: User, hash: "" },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  const path = location.pathname;
  const role = useAppStore((s) => s.role);
  const expert = role === "mentor";

  const isActive = (to: string) =>
    to === "/" ? path === "/" : path === to || path.startsWith(to + "/");

  const tabs = expert ? expertTabs : memberTabs;

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 pt-2 pb-3 safe-bottom">
        {tabs.map(({ to, label, Icon }, i) => {
          const hash = "hash" in tabs[i] ? (tabs[i] as { hash: string }).hash : "";
          const active =
            isActive(to) &&
            // На /mentor различаем вкладки по хэшу.
            (to !== "/mentor" || (location.hash || "material") === (hash || "material"));
          return (
            <Link
              key={label}
              to={to}
              hash={hash || undefined}
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
