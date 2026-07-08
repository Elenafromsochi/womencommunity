import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Calendar, UserRound, Megaphone, ArrowRight } from "lucide-react";
import { useAppStore } from "../lib/store";

export const Route = createFileRoute("/studio")({
  head: () => ({ meta: [{ title: "Женское общество — Студия наставника" }] }),
  component: StudioHome,
});

// Новости от администрации клуба (позже — из общей базы, пока тёплые примеры).
const CLUB_NEWS = [
  {
    title: "Общий эфир для наставниц",
    text: "В четверг встречаемся: как бережно рассказывать о своих продуктах. Можно присоединиться и задать вопрос.",
  },
  {
    title: "Открыт набор в витрину экспертов",
    text: "Заполните «Мою страницу» — и участницы увидят вас в разделе «Наставники».",
  },
];

function StudioHome() {
  const profile = useAppStore((s) => s.profile);
  const myMaterials = useAppStore((s) => s.myMaterials);
  const myEvents = useAppStore((s) => s.myEvents);

  return (
    <div className="px-6 space-y-8 pb-4">
      <section>
        <h1 className="font-[Lora] text-3xl text-balance leading-tight">
          Студия, <span className="italic">{profile.name}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ваше пространство: материалы, события и связь с участницами.
        </p>
      </section>

      {/* Мини-статистика */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-card ring-1 ring-border rounded-[1.5rem] p-5">
          <p className="font-[Lora] text-3xl">{myMaterials.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Материалов</p>
        </div>
        <div className="bg-card ring-1 ring-border rounded-[1.5rem] p-5">
          <p className="font-[Lora] text-3xl">{myEvents.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Событий</p>
        </div>
      </section>

      {/* Быстрые действия */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/mentor" hash="material" className="bg-card ring-1 ring-border rounded-2xl p-4 flex flex-col gap-1.5">
            <FileText className="size-5 text-primary" />
            <span className="text-sm font-medium leading-tight">Новый материал</span>
          </Link>
          <Link to="/mentor" hash="event" className="bg-card ring-1 ring-border rounded-2xl p-4 flex flex-col gap-1.5">
            <Calendar className="size-5 text-accent" />
            <span className="text-sm font-medium leading-tight">Новое событие</span>
          </Link>
          <Link to="/mentor" hash="profile" className="bg-card ring-1 ring-border rounded-2xl p-4 flex flex-col gap-1.5">
            <UserRound className="size-5 text-primary" />
            <span className="text-sm font-medium leading-tight">Моя страница</span>
          </Link>
          <Link to="/profile" className="bg-cream ring-1 ring-border rounded-2xl p-4 flex flex-col gap-1.5 justify-center">
            <span className="text-sm font-medium leading-tight">Вернуться участницей</span>
            <span className="text-[11px] text-muted-foreground">Сменить роль в профиле</span>
          </Link>
        </div>
      </section>

      {/* Новости клуба */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Новости клуба</h2>
        {CLUB_NEWS.map((n, i) => (
          <div key={i} className="bg-cream ring-1 ring-border rounded-[1.5rem] p-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary font-medium">
              <Megaphone className="size-3.5" />
              Клуб
            </span>
            <h3 className="font-[Lora] text-lg mt-1.5 leading-snug">{n.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.text}</p>
          </div>
        ))}
      </section>

      {/* Кабинет целиком */}
      <Link
        to="/mentor"
        className="flex items-center justify-between bg-primary text-primary-foreground rounded-[1.5rem] p-5"
      >
        <span className="font-[Lora] text-lg">Открыть кабинет</span>
        <ArrowRight className="size-5" />
      </Link>
    </div>
  );
}
