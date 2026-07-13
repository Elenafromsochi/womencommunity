import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, Calendar, UserRound, Megaphone, ArrowRight, Crown, ChevronRight } from "lucide-react";
import { useAppStore } from "../lib/store";

export const Route = createFileRoute("/studio")({
  head: () => ({ meta: [{ title: "Женское общество — Кабинет эксперта" }] }),
  component: StudioHome,
});

// Новости от администрации клуба (позже — из общей базы, пока тёплые примеры).
const CLUB_NEWS = [
  {
    title: "Общий эфир для экспертов",
    text: "В четверг встречаемся: как бережно рассказывать о своих продуктах. Можно присоединиться и задать вопрос.",
  },
  {
    title: "Открыт набор в витрину экспертов",
    text: "Заполните «Мою страницу» — и участницы увидят вас в разделе «Эксперты».",
  },
];

function StudioHome() {
  const profile = useAppStore((s) => s.profile);
  const subscription = useAppStore((s) => s.subscription);
  const setRole = useAppStore((s) => s.setRole);
  const navigate = useNavigate();
  const accessActive = subscription?.active;
  const accessUntil = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : "";

  return (
    <div className="px-6 space-y-8 pb-4">
      <section>
        <h1 className="font-[Lora] text-3xl text-balance leading-tight">
          Здравствуйте, <span className="italic">{profile.name}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ваше пространство: материалы, события и связь с участницами.
        </p>
      </section>

      {/* Доступ к платформе */}
      <Link
        to="/subscription"
        className={`flex items-center gap-3 rounded-[2rem] p-5 ring-1 ${
          accessActive ? "bg-primary text-primary-foreground ring-primary" : "bg-cream ring-border"
        }`}
      >
        <div
          className={`size-11 rounded-full flex items-center justify-center ${
            accessActive ? "bg-primary-foreground/15" : "bg-card ring-1 ring-border"
          }`}
        >
          <Crown className={`size-5 ${accessActive ? "text-primary-foreground" : "text-primary"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {accessActive ? "Доступ активен" : "Доступ к платформе"}
          </p>
          <p className={`text-xs ${accessActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            {accessActive ? `Действует до ${accessUntil}` : "Оформить доступ, чтобы вести и продавать"}
          </p>
        </div>
        <ChevronRight className={`size-4 shrink-0 ${accessActive ? "text-primary-foreground/80" : "text-muted-foreground"}`} />
      </Link>

      {/* Сводка */}
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-card ring-1 ring-border rounded-[1.5rem] p-4">
          <p className="font-[Lora] text-2xl">0</p>
          <p className="text-[11px] text-muted-foreground mt-1">Просмотры</p>
        </div>
        <div className="bg-card ring-1 ring-border rounded-[1.5rem] p-4">
          <p className="font-[Lora] text-2xl">0</p>
          <p className="text-[11px] text-muted-foreground mt-1">Заявки</p>
        </div>
        <div className="bg-card ring-1 ring-border rounded-[1.5rem] p-4">
          <p className="font-[Lora] text-2xl">0</p>
          <p className="text-[11px] text-muted-foreground mt-1">Сообщения</p>
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
          <Link to="/profile" className="bg-card ring-1 ring-border rounded-2xl p-4 flex flex-col gap-1.5">
            <UserRound className="size-5 text-primary" />
            <span className="text-sm font-medium leading-tight">Моя страница</span>
          </Link>
          <button
            onClick={() => {
              setRole("member");
              navigate({ to: "/" });
            }}
            className="bg-cream ring-1 ring-border rounded-2xl p-4 flex flex-col gap-1.5 justify-center text-left"
          >
            <span className="text-sm font-medium leading-tight">Вернуться участницей</span>
            <span className="text-[11px] text-muted-foreground">Открыть интерфейс участницы</span>
          </button>
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
