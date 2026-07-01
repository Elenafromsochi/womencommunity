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
} from "lucide-react";
import { useAppStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { Wreath } from "../components/Wreath";
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
  const savedContentIds = useAppStore((s) => s.savedContentIds);
  const savedMentorIds = useAppStore((s) => s.savedMentorIds);
  const registeredEventIds = useAppStore((s) => s.registeredEventIds);
  const appliedGroupIds = useAppStore((s) => s.appliedGroupIds);

  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const diagnostic = useAppStore((s) => s.diagnostic);
  const sphereScores = useAppStore((s) => s.sphereScores);

  const savedContent = contentItems.filter((c) => savedContentIds.includes(c.id));
  const savedMentors = mentors.filter((m) => savedMentorIds.includes(m.id));
  const myEvents = events.filter((e) => registeredEventIds.includes(e.id));
  const myGroups = groups.filter((g) => appliedGroupIds.includes(g.id));

  return (
    <div className="px-6 space-y-8 pb-4">
      {/* Колесо баланса */}
      <section className="flex flex-col items-center">
        <h2 className="font-[Lora] text-xl self-start mb-1">Колесо баланса</h2>
        {diagnostic ? (
          <>
            <Wreath
              size={280}
              supportSphere={diagnostic.supportSphere}
              selectedSpheres={diagnostic.selectedSpheres}
              supportScore={sphereScores[diagnostic.supportSphere]}
              scores={sphereScores}
              onSelect={(id) =>
                navigate({ to: "/sphere/$sphereId", params: { sphereId: id } })
              }
            />
            <p className="text-xs text-muted-foreground -mt-1">
              Нажмите на сферу, чтобы открыть её
            </p>
          </>
        ) : (
          <Link
            to="/onboarding"
            className="w-full bg-cream rounded-[2rem] p-6 text-center ring-1 ring-border"
          >
            <span className="text-3xl">🌿</span>
            <p className="font-[Lora] text-lg mt-2">Соберите своё колесо</p>
            <p className="text-xs text-muted-foreground mt-1">
              Пройдите короткое знакомство с собой — и здесь появится ваш венок сфер.
            </p>
          </Link>
        )}
      </section>

      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="size-20 rounded-full bg-cream flex items-center justify-center text-4xl ring-1 ring-border overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <span>👩</span>
          )}
        </div>
        <div>
          <h1 className="font-[Lora] text-2xl leading-tight">{profile.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{profile.city}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {profile.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="text-[10px] px-2.5 py-1 bg-cream rounded-full text-muted-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={savedContent.length} label="Сохранено" icon={<Bookmark className="size-4 text-primary" />} />
        <StatCard value={myEvents.length} label="Мероприятия" icon={<Calendar className="size-4 text-accent" />} />
        <StatCard value={myGroups.length} label="Группы" icon={<Users className="size-4 text-rose" />} />
      </div>

      {/* Cycle */}
      <Link
        to="/cycle"
        className="flex items-center justify-between bg-rose/10 ring-1 ring-rose/20 rounded-[1.5rem] p-5"
      >
        <div>
          <p className="font-[Lora] text-lg">Мой цикл</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Даты, самочувствие, подсказка о фазе
          </p>
        </div>
        <span className="text-2xl">🌙</span>
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
              <div
                key={item.id}
                className="bg-card p-4 rounded-[1.5rem] ring-1 ring-border flex items-center gap-3"
              >
                <Bookmark className="size-4 text-primary shrink-0" />
                <span className="text-sm truncate">{item.title}</span>
              </div>
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
              <div
                key={event.id}
                className="bg-card p-4 rounded-[1.5rem] ring-1 ring-border flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date.split(" ").slice(0, 2).join(" ")} • {event.time}
                  </p>
                </div>
                <Calendar className="size-4 text-accent shrink-0" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Role switcher */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Тестовый режим</h2>
        <p className="text-xs text-muted-foreground">
          Переключайтесь между ролями для демонстрации интерфейсов
        </p>
        <div className="space-y-2">
          {[
            { key: "member" as const, label: "Участница", desc: "Основной интерфейс" },
            { key: "mentor" as const, label: "Наставник", desc: "Кабинет наставника" },
            { key: "curator" as const, label: "Куратор", desc: "Кабинет куратора" },
            { key: "admin" as const, label: "Администратор", desc: "Панель управления" },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
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
