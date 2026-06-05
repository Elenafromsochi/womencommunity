import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, User } from "lucide-react";
import { useAppStore } from "../lib/store";
import { notifications } from "../lib/mock-data";

export function AppHeader() {
  const { location } = useRouterState();
  const path = location.pathname;
  const profile = useAppStore((s) => s.profile);
  const read = useAppStore((s) => s.notificationsRead);
  const unread = notifications.filter((n) => !n.read && !read.includes(n.id)).length;

  // hide on onboarding & detail pages with their own header
  if (path.startsWith("/onboarding")) return null;

  const titleMap: Record<string, string> = {
    "/": "Женское общество",
    "/topics": "Темы",
    "/mentors": "Наставники",
    "/events": "События",
    "/community": "Сообщество",
    "/groups": "Группы",
    "/profile": "Профиль",
    "/notifications": "Уведомления",
  };
  const title = titleMap[path] ?? "Женское общество";

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="font-[Lora] text-lg leading-none truncate">{title}</h1>
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
