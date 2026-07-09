import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Star,
  MessageCircle,
  Calendar,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { reviews } from "../lib/mock-data";
import { useAllMentors } from "../lib/content";
import { useAppStore } from "../lib/store";
import { toast } from "sonner";

/** Превратить контакт (телеграм/почта/ссылка) в кликабельный href. */
function contactHref(c: string): string {
  const v = c.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^@[\w]+$/.test(v)) return `https://t.me/${v.slice(1)}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  return v.startsWith("t.me") || v.includes(".") ? `https://${v}` : v;
}

export const Route = createFileRoute("/mentors_/$mentorId")({
  head: () => ({
    meta: [
      { title: "Женское общество — Эксперт" },
      { name: "description", content: "Страница эксперта" },
    ],
  }),
  component: MentorDetailPage,
});

function MentorDetailPage() {
  const { mentorId } = Route.useParams();
  const mentor = useAllMentors().find((m) => m.id === mentorId);
  const savedMentorIds = useAppStore((s) => s.savedMentorIds);
  const toggleSavedMentor = useAppStore((s) => s.toggleSavedMentor);
  const isSaved = mentor ? savedMentorIds.includes(mentor.id) : false;

  if (!mentor) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground">
        Эксперт не найден
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="px-6 pt-2 flex items-center gap-3">
        <Link
          to="/mentors"
          className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-border"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span className="font-[Lora] text-lg">Эксперт</span>
      </div>

      {/* Profile */}
      <div className="px-6">
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-full bg-cream flex items-center justify-center ring-1 ring-border/50 overflow-hidden">
            {mentor.avatar ? (
              <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">👩‍⚕️</span>
            )}
          </div>
          <div>
            <h1 className="font-[Lora] text-2xl leading-tight">{mentor.name}</h1>
            <p className="text-sm text-accent font-medium mt-1">
              {mentor.specialization}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-4 text-primary fill-primary" />
                {mentor.rating}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="size-4" />
                {mentor.reviews} отзывов
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          {mentor.description}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              toggleSavedMentor(mentor.id);
              toast.success(isSaved ? "Удалено из избранного" : "Добавлено в избранное");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-full transition-colors ${
              isSaved
                ? "bg-primary text-primary-foreground"
                : "bg-card ring-1 ring-border text-foreground"
            }`}
          >
            <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "В избранном" : "В избранное"}
          </button>
          {mentor.userId ? (
            <Link
              to="/chat/$peerId"
              params={{ peerId: mentor.userId }}
              search={{ name: mentor.name }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-full"
            >
              <MessageCircle className="size-4" />
              Написать
            </Link>
          ) : mentor.contact ? (
            <a
              href={contactHref(mentor.contact)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-full"
            >
              <MessageCircle className="size-4" />
              Связаться
            </a>
          ) : (
            <button
              onClick={() => toast.success("Сообщение отправлено эксперту")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-full"
            >
              <MessageCircle className="size-4" />
              Написать
            </button>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="px-6">
        <h2 className="font-[Lora] text-xl mb-3">Опыт</h2>
        <p className="text-sm text-muted-foreground leading-relaxed bg-card p-5 rounded-[2rem] ring-1 ring-border">
          {mentor.experience}
        </p>
      </div>

      {/* Topics */}
      <div className="px-6">
        <h2 className="font-[Lora] text-xl mb-3">Темы работы</h2>
        <div className="flex flex-wrap gap-2">
          {mentor.topics.map((topic) => (
            <span
              key={topic}
              className="px-4 py-2 bg-card rounded-full text-sm ring-1 ring-border"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Materials count */}
      <div className="px-6">
        <div className="bg-card p-5 rounded-[2rem] ring-1 ring-border flex items-center justify-between">
          <div>
            <p className="font-[Lora] text-lg">Материалы эксперта</p>
            <p className="text-sm text-muted-foreground">
              Статьи, аудио, видео и практики
            </p>
          </div>
          <span className="text-2xl font-[Lora] font-semibold text-primary">
            {mentor.materialsCount}
          </span>
        </div>
      </div>

      {/* Events */}
      <div className="px-6">
        <h2 className="font-[Lora] text-xl mb-3">Ближайшие мероприятия</h2>
        <div className="space-y-3">
          {mentor.events.map((event) => (
            <Link
              key={event.id}
              to="/events/$eventId"
              params={{ eventId: event.id }}
              className="bg-card p-4 rounded-[1.5rem] ring-1 ring-border flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-accent font-mono">
                  {event.date} • {event.time}
                </p>
                <p className="text-sm font-medium mt-1">{event.title}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Groups */}
      {mentor.groups.length > 0 && (
        <div className="px-6 pb-6">
          <h2 className="font-[Lora] text-xl mb-3">Группы сопровождения</h2>
          <div className="space-y-3">
            {mentor.groups.map((group) => (
              <Link
                key={group.id}
                to="/groups/$groupId"
                params={{ groupId: group.id }}
                className="bg-card p-4 rounded-[1.5rem] ring-1 ring-border flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{group.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Старт: {group.startDate}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Отзывы (у новых наставников их ещё нет) */}
      {mentor.reviews > 0 && (
      <div className="px-6 pb-8">
        <h2 className="font-[Lora] text-xl mb-3">Отзывы</h2>
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card p-4 rounded-[1.5rem] ring-1 ring-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{r.author}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${i < r.rating ? "fill-primary text-primary" : "text-border"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {r.text}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-2">{r.date}</p>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
