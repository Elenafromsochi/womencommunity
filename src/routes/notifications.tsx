import { createFileRoute } from "@tanstack/react-router";
import { Bell, BookOpen, MessageSquare, Calendar, Users, Clock } from "lucide-react";
import { notifications } from "../lib/mock-data";
import { useAppStore } from "../lib/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Женское общество — Уведомления" },
      { name: "description", content: "Уведомления" },
    ],
  }),
  component: NotificationsPage,
});

const typeIcons: Record<string, React.ReactNode> = {
  material: <BookOpen className="size-4 text-primary" />,
  reply: <MessageSquare className="size-4 text-accent" />,
  message: <MessageSquare className="size-4 text-sage" />,
  event: <Calendar className="size-4 text-primary" />,
  group: <Users className="size-4 text-accent" />,
  reminder: <Clock className="size-4 text-rose" />,
};

const typeLabels: Record<string, string> = {
  material: "Новый материал",
  reply: "Ответ",
  message: "Сообщение",
  event: "Мероприятие",
  group: "Группа",
  reminder: "Напоминание",
};

function NotificationsPage() {
  const notificationsRead = useAppStore((s) => s.notificationsRead);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  return (
    <div className="px-6 space-y-6 pb-4">
      <h1 className="font-[Lora] text-3xl leading-tight">Уведомления</h1>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const read = notificationsRead.includes(notification.id);
          return (
            <button
              key={notification.id}
              onClick={() => markNotificationRead(notification.id)}
              className={`w-full text-left bg-card p-4 rounded-[1.5rem] ring-1 transition-all flex gap-3 ${
                read
                  ? "ring-border opacity-60"
                  : "ring-border hover:ring-primary/30"
              }`}
            >
              <div className="size-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                {typeIcons[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {typeLabels[notification.type]}
                  </span>
                  {!read && (
                    <span className="size-1.5 bg-primary rounded-full" />
                  )}
                </div>
                <p className="text-sm font-medium leading-snug">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {notification.body}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {notification.date}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
