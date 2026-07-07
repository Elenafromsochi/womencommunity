import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MapPin, Video, Users, Clock } from "lucide-react";
import { useAllEvents } from "../lib/content";
import { useAppStore } from "../lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/events_/$eventId")({
  head: () => ({
    meta: [
      { title: "Женское общество — Мероприятие" },
      { name: "description", content: "Страница мероприятия" },
    ],
  }),
  component: EventDetailPage,
});

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const event = useAllEvents().find((e) => e.id === eventId);
  const registeredEventIds = useAppStore((s) => s.registeredEventIds);
  const toggleEventRegistration = useAppStore((s) => s.toggleEventRegistration);
  const isRegistered = event ? registeredEventIds.includes(event.id) : false;

  if (!event) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground">
        Мероприятие не найдено
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="px-6 pt-2 flex items-center gap-3">
        <Link
          to="/events"
          className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-border"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span className="font-[Lora] text-lg">Мероприятие</span>
      </div>

      {/* Cover */}
      <div className="px-6">
        <div className="aspect-[4/3] rounded-[2.5rem] bg-cream flex items-center justify-center ring-1 ring-border overflow-hidden">
          {event.cover ? (
            <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">{event.type === "online" ? "💻" : "🌿"}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-6 space-y-4">
        <div className="flex items-center gap-2">
          {event.price === 0 ? (
            <span className="text-[10px] text-accent font-medium bg-accent/10 px-2.5 py-1 rounded-full">
              Бесплатно
            </span>
          ) : (
            <span className="text-[10px] text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full">
              {event.price.toLocaleString("ru-RU")} ₽
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-card px-2.5 py-1 rounded-full ring-1 ring-border">
            {event.type === "online" ? "Онлайн" : "Офлайн"}
          </span>
        </div>

        <h1 className="font-[Lora] text-2xl leading-tight">{event.title}</h1>
        <p className="text-sm text-muted-foreground">{event.mentor}</p>

        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full ring-1 ring-border">
            <Clock className="size-3.5" />
            {event.date.split(" ").slice(0, 2).join(" ")} • {event.time}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full ring-1 ring-border">
            {event.type === "online" ? (
              <Video className="size-3.5" />
            ) : (
              <MapPin className="size-3.5" />
            )}
            {event.location}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full ring-1 ring-border">
            <Users className="size-3.5" />
            {event.spots} мест свободно
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {event.description}
        </p>

        {isRegistered ? (
          <div className="w-full py-3.5 text-center text-sm font-medium text-accent bg-accent/10 rounded-full">
            Вы записаны на это мероприятие
          </div>
        ) : (
          <button
            onClick={() => {
              toggleEventRegistration(event.id);
              toast.success("Вы записаны на мероприятие!");
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium bg-primary text-primary-foreground rounded-full"
          >
            Записаться
            <ArrowRight className="size-4" />
          </button>
        )}
        <button
          onClick={() => toast.success("Напоминание установлено")}
          className="w-full py-3 text-sm font-medium bg-cream text-foreground rounded-full"
        >
          Напомнить мне
        </button>
      </div>
    </div>
  );
}
