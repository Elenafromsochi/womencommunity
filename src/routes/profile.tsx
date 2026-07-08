import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Heart,
  Bookmark,
  Calendar,
  Users,
  Star,
  MessageCircle,
  Settings,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { WheelOfBalance } from "../components/WheelOfBalance";
import { computeCycleStatus, todayISO } from "../lib/cycle";
import { computeOverallState } from "../lib/methodology";
import { events, mentors, groups, contentItems } from "../lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Женское общество — Профиль" },
      { name: "description", content: "Профиль участницы" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = useAppStore((s) => s.profile);
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const expertProfile = useAppStore((s) => s.expertProfile);
  const isExpert = Boolean(expertProfile.specialization?.trim());
  const savedContentIds = useAppStore((s) => s.savedContentIds);
  const savedMentorIds = useAppStore((s) => s.savedMentorIds);
  const registeredEventIds = useAppStore((s) => s.registeredEventIds);
  const appliedGroupIds = useAppStore((s) => s.appliedGroupIds);

  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const sphereScores = useAppStore((s) => s.sphereScores);
  const focusSpheres = useAppStore((s) => s.focusSpheres);
  const progress = useAppStore((s) => s.progress);
  const diagnostic = useAppStore((s) => s.diagnostic);
  const scoredCount = Object.keys(sphereScores).length;
  const pulse = progress?.wellbeingHistory?.at(-1)?.value ?? diagnostic?.wellbeing;
  // Центр колеса — общее состояние: среднее из самочувствия и всех сфер.
  const stateScore = computeOverallState(pulse, sphereScores) ?? undefined;
  const cycle = useAppStore((s) => s.cycle);
  const cycleStatus =
    cycle && cycle.periods.length > 0
      ? computeCycleStatus(cycle, todayISO())
      : null;

  const savedContent = contentItems.filter((c) => savedContentIds.includes(c.id));
  const savedMentors = mentors.filter((m) => savedMentorIds.includes(m.id));
  const myEvents = events.filter((e) => registeredEventIds.includes(e.id));
  const myGroups = groups.filter((g) => appliedGroupIds.includes(g.id));

  return (
    <div className="px-6 space-y-8 pb-4">
      {/* Profile header */}
      <div className="flex items-start gap-4">
        <Link
          to="/edit-profile"
          className="size-20 shrink-0 rounded-full bg-cream flex items-center justify-center text-4xl ring-1 ring-border overflow-hidden"
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <span>👩</span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-[Lora] text-2xl leading-tight">{profile.name}</h1>
                {/* Плашка «Эксперт» в участническом профиле — учусь и преподаю */}
                {role === "member" && isExpert && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                    Эксперт
                  </span>
                )}
              </div>
              {role === "mentor" ? (
                expertProfile.specialization && (
                  <p className="text-sm text-muted-foreground mt-0.5">{expertProfile.specialization}</p>
                )
              ) : (
                profile.city && (
                  <p className="text-sm text-muted-foreground mt-0.5">{profile.city}</p>
                )
              )}
            </div>
            <Link
              to="/edit-profile"
              className="shrink-0 text-xs text-accent font-medium border-b border-accent/30 pb-0.5"
            >
              {role === "mentor" ? "Изменить фото" : "Изменить"}
            </Link>
          </div>
          {/* «О себе» — только у участницы (у эксперта своё описание на его странице) */}
          {role === "member" && profile.about && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {profile.about}
            </p>
          )}
        </div>
      </div>

      {/* Экспертная страница — только для наставника */}
      {role === "mentor" && <ExpertPageEditor />}

      {/* Участнический профиль — только в роли участницы */}
      {role === "member" && (
      <>
      {/* Колесо баланса */}
      <section className="flex flex-col items-center">
        <h2 className="font-[Lora] text-xl self-start mb-2">Колесо баланса</h2>
        <WheelOfBalance
          size={300}
          scores={sphereScores}
          focus={focusSpheres}
          stateScore={stateScore}
          onSelect={(id) =>
            navigate({ to: "/sphere/$sphereId", params: { sphereId: id } })
          }
          onSelectState={() => navigate({ to: "/state" })}
        />
        <p className="text-xs text-muted-foreground text-center mt-2 max-w-[270px]">
          {scoredCount === 0
            ? "Нажмите на сектор и оцените сферу. В центре — «Состояние»."
            : "В центре — «Состояние». ★ — фокус-сферы. Нажмите на сектор или центр."}
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={savedContent.length} label="Сохранено" icon={<Bookmark className="size-4 text-primary" />} />
        <StatCard value={myEvents.length} label="Мероприятия" icon={<Calendar className="size-4 text-accent" />} />
        <StatCard value={myGroups.length} label="Группы" icon={<Users className="size-4 text-rose" />} />
      </div>

      {/* Cycle */}
      <Link
        to="/cycle"
        className="block bg-rose/10 ring-1 ring-rose/20 rounded-[2rem] p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-rose/80 font-medium">
              Мой цикл
            </span>
            <h3 className="font-[Lora] text-lg mt-1 leading-tight">
              {cycleStatus
                ? `${cycleStatus.phaseLabel} · день ${cycleStatus.cycleDay}`
                : "Настроить трекер цикла"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {cycleStatus
                ? cycleStatus.phaseHint
                : "Даты, самочувствие, подсказка о фазе"}
            </p>
          </div>
          <span className="text-2xl shrink-0">🌙</span>
        </div>
      </Link>

      {/* Saved content */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Сохраненные материалы</h2>
        {savedContent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Пока ничего не сохранено. Исследуйте раздел «Темы».
          </p>
        ) : (
          <div className="space-y-2">
            {savedContent.map((item) => (
              <Link
                key={item.id}
                to="/material/$id"
                params={{ id: item.id }}
                className="bg-card p-4 rounded-[1.5rem] ring-1 ring-border flex items-center gap-3"
              >
                <Bookmark className="size-4 text-primary shrink-0" />
                <span className="text-sm truncate flex-1">{item.title}</span>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Saved mentors */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Избранные наставники</h2>
        {savedMentors.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Пока нет избранных наставников.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
            {savedMentors.map((mentor) => (
              <Link
                key={mentor.id}
                to="/mentors/$mentorId"
                params={{ mentorId: mentor.id }}
                className="shrink-0 w-28 flex flex-col items-center text-center"
              >
                <div className="size-16 rounded-full bg-cream flex items-center justify-center text-xl ring-1 ring-border/50 mb-2 overflow-hidden">
                  {mentor.avatar ? (
                    <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span>👩‍⚕️</span>
                  )}
                </div>
                <span className="text-sm font-[Lora] leading-tight">
                  {mentor.name}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {mentor.specialization}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* My events */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Мои мероприятия</h2>
        {myEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Вы еще не записались ни на одно мероприятие.
          </p>
        ) : (
          <div className="space-y-2">
            {myEvents.map((event) => (
              <Link
                key={event.id}
                to="/events/$eventId"
                params={{ eventId: event.id }}
                className="bg-card p-4 rounded-[1.5rem] ring-1 ring-border flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date.split(" ").slice(0, 2).join(" ")} • {event.time}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>
      </>
      )}

      {/* Role switcher */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Тестовый режим</h2>
        <p className="text-xs text-muted-foreground">
          Переключайтесь между ролями — интерфейс сразу откроется
        </p>
        <div className="space-y-2">
          {[
            { key: "member" as const, label: "Участница", desc: "Основной интерфейс", to: "/" },
            { key: "mentor" as const, label: "Наставник", desc: "Студия наставника", to: "/studio" },
            { key: "curator" as const, label: "Куратор", desc: "Кабинет куратора", to: "/curator" },
            { key: "admin" as const, label: "Администратор", desc: "Панель управления", to: "/admin" },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setRole(r.key);
                navigate({ to: r.to });
              }}
              className={`w-full flex items-center justify-between p-4 rounded-[1.5rem] ring-1 transition-all ${
                role === r.key
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground ring-border hover:ring-primary/30"
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-medium">{r.label}</p>
                <p
                  className={`text-xs ${
                    role === r.key ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {r.desc}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Account */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Аккаунт</h2>
        {session?.user?.email && (
          <p className="text-xs text-muted-foreground">{session.user.email}</p>
        )}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center p-4 rounded-[1.5rem] ring-1 ring-border bg-card text-sm font-medium text-destructive hover:ring-destructive/30 transition-all"
        >
          Выйти из аккаунта
        </button>
      </section>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card p-4 rounded-[1.5rem] ring-1 ring-border flex flex-col items-center text-center gap-2">
      {icon}
      <span className="text-xl font-[Lora] font-semibold">{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

const efield =
  "w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary";

/** Редактор экспертной страницы — в профиле наставника. */
function ExpertPageEditor() {
  const ep = useAppStore((s) => s.expertProfile);
  const update = useAppStore((s) => s.updateExpertProfile);
  return (
    <section className="bg-card ring-1 ring-border rounded-[2rem] p-5 space-y-3">
      <div>
        <h2 className="font-[Lora] text-lg">Моя страница эксперта</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Так вас увидят участницы в разделе «Наставники».
        </p>
      </div>
      <input value={ep.specialization ?? ""} onChange={(e) => update({ specialization: e.target.value })} placeholder="Специализация — напр. Психолог, коуч по деньгам" className={efield} />
      <input value={ep.tagline ?? ""} onChange={(e) => update({ tagline: e.target.value })} placeholder="Коротко о вас, одной строкой" className={efield} />
      <textarea value={ep.offer ?? ""} onChange={(e) => update({ offer: e.target.value })} rows={3} placeholder="Чем могу помочь — услуги, консультации, форматы" style={{ textTransform: "none" }} className={`${efield} resize-none`} />
      <textarea value={ep.about ?? ""} onChange={(e) => update({ about: e.target.value })} rows={4} placeholder="Подробнее о вашем опыте и подходе" style={{ textTransform: "none" }} className={`${efield} resize-none`} />
      <input value={ep.contact ?? ""} onChange={(e) => update({ contact: e.target.value })} inputMode="url" placeholder="Как связаться: телеграм, почта или ссылка" className={efield} />
      <button
        onClick={() => {
          update({ published: !ep.published });
          toast.success(ep.published ? "Страница скрыта" : "Страница видна участницам");
        }}
        disabled={!ep.specialization?.trim()}
        className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium border transition-all disabled:opacity-40 ${
          ep.published ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"
        }`}
      >
        {ep.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        {ep.published ? "Видна участницам" : "Показать участницам"}
      </button>
      {ep.published && (
        <Link to="/mentors/$mentorId" params={{ mentorId: "me" }} className="block text-center text-xs text-accent">
          Посмотреть, как это выглядит →
        </Link>
      )}
    </section>
  );
}
