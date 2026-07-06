import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users, HeartHandshake, UserPlus, LifeBuoy, PenLine, ChevronRight } from "lucide-react";
import { useAppStore } from "../lib/store";
import { events, mentors, groups, contentItems } from "../lib/mock-data";
import { topicsForSphere, sphereById } from "../lib/methodology";
import { PathCard } from "../components/PathCard";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Женское общество — Главная" },
      { name: "description", content: "Главная страница женского сообщества" },
    ],
  }),
  component: HomePage,
});

function MentorAvatar({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        loading="lazy"
      />
    );
  }
  return <span className="text-2xl">👩‍⚕️</span>;
}

function EventCover({ src, type }: { src?: string; type: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt="Обложка"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span className="text-3xl">{type === "online" ? "💻" : "🌿"}</span>
  );
}

function HomePage() {
  const profile = useAppStore((s) => s.profile);
  const registeredEventIds = useAppStore((s) => s.registeredEventIds);
  const toggleEventRegistration = useAppStore((s) => s.toggleEventRegistration);
  const appliedGroupIds = useAppStore((s) => s.appliedGroupIds);
  const toggleGroupApplication = useAppStore((s) => s.toggleGroupApplication);

  const focusSpheres = useAppStore((s) => s.focusSpheres);
  const focusTopics = focusSpheres.flatMap((id) => topicsForSphere(id));
  const focusContent = contentItems.filter((c) => focusTopics.includes(c.topic));

  // Мягкое напоминание про дневник, если сегодня ещё нет записи.
  const journalEntries = useAppStore((s) => s.journalEntries);
  const now = new Date();
  const hasJournalToday = journalEntries.some((e) => {
    const d = new Date(e.date);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });
  const focusName = focusSpheres[0] ? sphereById(focusSpheres[0]).name : null;

  const upcomingEvents = events.slice(0, 2);
  const recommendedMentors = mentors.slice(0, 3);
  const recommendedContent = focusContent[0] ?? contentItems[0];
  const feed = (focusContent.length ? focusContent : contentItems)
    .filter((c) => c.id !== recommendedContent?.id)
    .slice(0, 4);
  const openGroups = groups.filter((g) => g.spots > 0).slice(0, 2);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
  };

  return (
    <div className="px-6 space-y-8 pb-4">
      {/* Greeting */}
      <section>
        <h1 className="font-[Lora] text-3xl text-balance leading-tight">
          {getGreeting()}, <span className="italic">{profile.name}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Сегодня в клубе уютно и тепло.
        </p>
      </section>

      {/* Быстрая поддержка — живой человек в первую очередь */}
      <section className="bg-cream ring-1 ring-border rounded-[2rem] p-5 space-y-4">
        <div>
          <h2 className="font-[Lora] text-xl">Нужна поддержка?</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Вы не одна. Рядом живые люди и мягкие опоры.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/mentors"
            className="bg-card ring-1 ring-border rounded-2xl p-3.5 flex flex-col gap-1.5"
          >
            <HeartHandshake className="size-5 text-primary" />
            <span className="text-sm font-medium leading-tight">
              Поговорить с человеком
            </span>
            <span className="text-[11px] text-muted-foreground">Наставники клуба</span>
          </Link>
          <Link
            to="/buddy"
            className="bg-card ring-1 ring-border rounded-2xl p-3.5 flex flex-col gap-1.5"
          >
            <UserPlus className="size-5 text-accent" />
            <span className="text-sm font-medium leading-tight">Найти бадди</span>
            <span className="text-[11px] text-muted-foreground">Подруга по пути</span>
          </Link>
          <Link
            to="/state"
            hash="assistant"
            className="bg-card ring-1 ring-border rounded-2xl p-3.5 flex flex-col gap-1.5"
          >
            <LifeBuoy className="size-5 text-rose" />
            <span className="text-sm font-medium leading-tight">Мне сейчас трудно</span>
            <span className="text-[11px] text-muted-foreground">Помощник рядом · SOS</span>
          </Link>
          <Link
            to="/community"
            className="bg-card ring-1 ring-border rounded-2xl p-3.5 flex flex-col gap-1.5"
          >
            <Users className="size-5 text-primary" />
            <span className="text-sm font-medium leading-tight">Написать в клуб</span>
            <span className="text-[11px] text-muted-foreground">Женщины рядом</span>
          </Link>
        </div>
        <Link
          to="/state"
          hash="assistant"
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-0.5"
        >
          …или спросить бережного помощника
          <ArrowRight className="size-3.5" />
        </Link>
      </section>

      {/* Мягкое напоминание про дневник */}
      {!hasJournalToday && (
        <Link
          to="/state"
          hash="journal"
          className="bg-peach/25 ring-1 ring-peach/40 rounded-2xl p-4 flex items-center gap-3"
        >
          <span className="size-9 shrink-0 rounded-full bg-card flex items-center justify-center">
            <PenLine className="size-4 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight">Дневник сегодня ещё пуст</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {focusName
                ? `Что сегодня в сфере «${focusName}»? Пара строк для себя.`
                : "Пара строк для себя — это уже забота."}
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        </Link>
      )}

      {/* Ваш путь */}
      <PathCard />

      {/* Recommended */}
      {recommendedContent && (
        <section>
          <div className="bg-cream rounded-[2rem] p-6 relative overflow-hidden ring-1 ring-border">
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-widest text-primary/80 font-medium">
                Рекомендовано
              </span>
              <h3 className="font-[Lora] text-xl mt-2 mb-4 leading-snug">
                {recommendedContent.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[260px]">
                {recommendedContent.description}
              </p>
              <Link
                to="/material/$id"
                params={{ id: recommendedContent.id }}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-medium px-5 py-2.5 rounded-full"
              >
                Смотреть
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="absolute -right-8 -bottom-8 size-40 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </section>
      )}

      {/* Новое для вас */}
      {feed.length > 0 && (
        <section className="space-y-4">
          <Link to="/topics" className="flex items-center justify-between gap-2">
            <h2 className="font-[Lora] text-2xl">
              {focusSpheres.length > 0 ? "Новое по вашим фокус-сферам" : "Свежие материалы"}
            </h2>
            <ChevronRight className="size-5 text-muted-foreground shrink-0" />
          </Link>
          {focusSpheres.length > 0 && (
            <p className="-mt-2 text-xs text-muted-foreground">
              {focusSpheres.map((id) => sphereById(id).name).join(" · ")}
            </p>
          )}
          <div className="space-y-3">
            {feed.map((c) => (
              <Link
                key={c.id}
                to="/material/$id"
                params={{ id: c.id }}
                className="bg-card p-4 rounded-[1.75rem] ring-1 ring-border flex items-center gap-3"
              >
                <div className="size-12 shrink-0 rounded-[1.25rem] bg-cream flex items-center justify-center text-xl">
                  {c.type === "audio" ? "🎧" : c.type === "video" ? "🎬" : c.type === "practice" ? "🧘‍♀️" : "📖"}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-[Lora] text-base leading-tight truncate">{c.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.topic}
                    {c.duration ? ` · ${c.duration}` : ""}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Events */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <Link to="/events" className="flex items-center gap-1.5">
            <h2 className="font-[Lora] text-2xl">События</h2>
            <ChevronRight className="size-5 text-muted-foreground shrink-0" />
          </Link>
          <Link
            to="/events"
            className="text-xs text-accent font-medium border-b border-accent/30 pb-0.5"
          >
            Все встречи
          </Link>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="group bg-card p-3 rounded-[2rem] flex gap-4 ring-1 ring-border"
            >
              <div className="w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden bg-cream flex items-center justify-center">
                <EventCover src={event.cover} type={event.type} />
              </div>
              <div className="py-1 flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <p className="text-[9px] uppercase tracking-tighter text-accent font-mono">
                    {event.date.split(" ").slice(0, 2).join(" ")} • {event.time}
                  </p>
                  <h4 className="font-[Lora] text-base leading-tight mt-1 truncate">
                    {event.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground italic truncate max-w-[120px]">
                    {event.mentor}
                  </p>
                  {registeredEventIds.includes(event.id) ? (
                    <span className="text-[10px] text-accent font-medium">
                      Вы записаны
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        toggleEventRegistration(event.id);
                        toast.success("Вы записаны на мероприятие!");
                      }}
                      className="size-7 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-primary/10 transition-colors"
                    >
                      <ArrowRight className="size-3.5 text-foreground/60" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mentors */}
      <section className="space-y-4">
        <Link to="/mentors" className="flex items-center gap-1.5">
          <h2 className="font-[Lora] text-2xl">Наставники</h2>
          <ChevronRight className="size-5 text-muted-foreground shrink-0" />
        </Link>
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
          {recommendedMentors.map((mentor) => (
            <Link
              key={mentor.id}
              to="/mentors/$mentorId"
              params={{ mentorId: mentor.id }}
              className="shrink-0 w-32 flex flex-col items-center text-center"
            >
              <div className="size-24 rounded-full p-1 ring-1 ring-primary/20 mb-3 bg-cream flex items-center justify-center overflow-hidden">
                <MentorAvatar src={mentor.avatar} alt={mentor.name} />
              </div>
              <span className="text-sm font-[Lora] leading-tight">
                {mentor.name}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                {mentor.specialization}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Groups */}
      <section className="space-y-4 pb-6">
        <Link to="/groups" className="flex items-center gap-1.5">
          <h2 className="font-[Lora] text-2xl">Группы сопровождения</h2>
          <ChevronRight className="size-5 text-muted-foreground shrink-0" />
        </Link>
        <div className="space-y-3">
          {openGroups.map((group) => (
            <div
              key={group.id}
              className="bg-accent/5 border border-accent/10 p-5 rounded-[2.5rem] flex items-center justify-between"
            >
              <div className="min-w-0">
                <h4 className="font-[Lora] text-lg">{group.title}</h4>
                <p className="text-xs text-accent/80 mt-1 flex items-center gap-1">
                  <Users className="size-3" />
                  {group.spotsTotal - group.spots} участниц •{" "}
                  {group.spots} мест свободно
                </p>
              </div>
              {appliedGroupIds.includes(group.id) ? (
                <span className="text-[10px] text-accent font-medium shrink-0 ml-2">
                  Заявка подана
                </span>
              ) : (
                <button
                  onClick={() => {
                    toggleGroupApplication(group.id);
                    toast.success("Заявка отправлена!");
                  }}
                  className="size-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 ml-2 hover:bg-accent/20 transition-colors"
                >
                  <ArrowRight className="size-4 text-accent" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
