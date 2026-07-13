import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, User } from "lucide-react";
import { useAppStore } from "../lib/store";

// Подпись роли в шапке — чтобы в любом кабинете было видно, в каком вы режиме.
const ROLE_LABEL: Record<string, string | null> = {
  member: null, // участница — обычный режим, без плашки
  mentor: "Эксперт",
  curator: "Куратор",
  admin: "Администратор",
};

export function AppHeader() {
  const { location } = useRouterState();
  const path = location.pathname;
  const profile = useAppStore((s) => s.profile);
  const role = useAppStore((s) => s.role);
  const inbox = useAppStore((s) => s.inbox);
  const unread = inbox.filter((n) => !n.read).length;

  // hide on onboarding & detail pages with their own header
  if (path.startsWith("/onboarding")) return null;

  const titleMap: Record<string, string> = {
    "/": "Женское общество",
    "/topics": "Темы",
    "/mentors": "Эксперты",
    "/events": "События",
    "/community": "Сообщество",
    "/groups": "Группы",
    "/profile": "Профиль",
    "/notifications": "Уведомления",
  };
  const title = titleMap[path] ?? "Женское общество";
  const roleLabel = ROLE_LABEL[role];

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-[Lora] text-lg leading-none truncate">{title}</h1>
          {roleLabel && (
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide bg-primary/12 text-primary px-2 py-0.5 rounded-full ring-1 ring-primary/20">
              {roleLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            className="relative size-9 rounded-full bg-card flex items-center justify-center ring-1 ring-border"
          >
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">
                {unread}
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            className="size-9 rounded-full bg-cream flex items-center justify-center overflow-hidden ring-1 ring-border"
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <User className="size-4" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
