import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, BookOpen, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useAppStore } from "../lib/store";
import { markAllNotificationsRead } from "../lib/notifications-db";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Женское общество — Уведомления" },
      { name: "description", content: "Уведомления" },
    ],
  }),
  component: NotificationsPage,
});

function NotifIcon({ type, title }: { type: string; title: string }) {
  const cls = "size-4";
  if (type === "moderation_new") return <ShieldCheck className={`${cls} text-accent`} />;
  if (type === "moderation_result") {
    return title.includes("отклонён") ? (
      <XCircle className={`${cls} text-rose`} />
    ) : (
      <CheckCircle2 className={`${cls} text-primary`} />
    );
  }
  return <BookOpen className={`${cls} text-primary`} />;
}

const ruDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

function NotificationsPage() {
  const inbox = useAppStore((s) => s.inbox);
  const userId = useAppStore((s) => s.userId);
  const markInboxRead = useAppStore((s) => s.markInboxRead);
  const navigate = useNavigate();

  // Открыли экран — отмечаем всё прочитанным (и локально, и в базе).
  useEffect(() => {
    if (!userId) return;
    const hasUnread = useAppStore.getState().inbox.some((n) => !n.read);
    if (hasUnread) {
      markInboxRead();
      void markAllNotificationsRead(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="px-6 space-y-6 pb-4">
      <h1 className="font-[Lora] text-3xl leading-tight">Уведомления</h1>

      {inbox.length === 0 ? (
        <div className="bg-cream p-8 rounded-[2rem] ring-1 ring-border text-center">
          <div className="size-14 rounded-full bg-card flex items-center justify-center text-2xl mx-auto mb-3 ring-1 ring-border/50">
            <Bell className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Пока нет уведомлений.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inbox.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (n.link) navigate({ to: n.link });
              }}
              className={`w-full text-left bg-card p-4 rounded-[1.5rem] ring-1 transition-all flex gap-3 ${
                n.read ? "ring-border opacity-60" : "ring-primary/30"
              }`}
            >
              <div className="size-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                <NotifIcon type={n.type} title={n.title} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {!n.read && <span className="size-1.5 bg-primary rounded-full shrink-0" />}
                </div>
                {n.body && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">{ruDateTime(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
