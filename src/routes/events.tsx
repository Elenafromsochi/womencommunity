import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Users, Video, MapPinned } from "lucide-react";
import { useState } from "react";
import { useAllEvents } from "../lib/content";
import { useAppStore } from "../lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Женское общество — Мероприятия" },
      { name: "description", content: "Календарь мероприятий" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "free" | "paid">("all");
  const registeredEventIds = useAppStore((s) => s.registeredEventIds);
  const toggleEventRegistration = useAppStore((s) => s.toggleEventRegistration);

  const events = useAllEvents();
  const filtered = events.filter((e) => {
    if (filter === "all") return true;
    if (filter === "online") return e.type === "online";
    if (filter === "offline") return e.type === "offline";
    if (filter === "free") return e.price === 0;
    if (filter === "paid") return e.price > 0;
    return true;
  });

  const filters: { key: typeof filter; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "online", label: "Онлайн" },
    { key: "offline", label: "Офлайн" },
    { key: "free", label: "Бесплатно" },
    { key: "paid", label: "Платно" },
  ];

  return (
    <div className="px-6 space-y-6 pb-4">
      <h1 className="font-[Lora] text-3xl leading-tight">Мероприятия</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-card p-4 rounded-[2.5rem] ring-1 ring-border"
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden bg-cream flex items-center justify-center">
                {event.cover ? (
                  <img src={event.cover} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-3xl">{event.type === "online" ? "💻" : "🌿"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] uppercase tracking-wider text-accent font-mono">
                      {event.date.split(" ").slice(0, 2).join(" ")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {event.time}
                    </span>
                    {event.price === 0 ? (
                      <span className="text-[9px] text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">
                        Бесплатно
                      </span>
                    ) : (
                      <span className="text-[9px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                        {event.price.toLocaleString("ru-RU")} ₽
                      </span>
                    )}
                  </div>
                  <h4 className="font-[Lora] text-base leading-tight">
                    {event.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.mentor}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  {event.type === "online" ? (
                    <Video className="size-3.5" />
                  ) : (
                    <MapPinned className="size-3.5" />
                  )}
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              {registeredEventIds.includes(event.id) ? (
                <span className="flex-1 text-center py-2.5 text-sm font-medium text-accent bg-accent/10 rounded-full">
                  Вы записаны
                </span>
              ) : (
                <button
                  onClick={() => {
                    toggleEventRegistration(event.id);
                    toast.success("Вы записаны на мероприятие!");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full"
                >
                  Записаться
                  <ArrowRight className="size-3.5" />
                </button>
              )}
              <button
                onClick={() => toast.success("Напоминание установлено")}
                className="px-4 py-2.5 text-sm font-medium bg-cream text-foreground rounded-full"
              >
                Напомнить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
