import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { useAppStore } from "../lib/store";
import { sphereById, topicsForSphere, SPHERES } from "../lib/methodology";
import { contentItems, mentors, events } from "../lib/mock-data";
import type { SphereId } from "../lib/types";
import { Scale } from "../components/Scale";
import { toast } from "sonner";

export const Route = createFileRoute("/sphere/$sphereId")({
  head: () => ({
    meta: [{ title: "Женское общество — Сфера" }],
  }),
  component: SpherePage,
});

function SpherePage() {
  const { sphereId } = Route.useParams();
  const known = SPHERES.some((s) => s.id === sphereId);
  const sphere = sphereById(sphereId as SphereId);

  const sphereScores = useAppStore((s) => s.sphereScores);
  const sphereGoals = useAppStore((s) => s.sphereGoals);
  const setSphereScore = useAppStore((s) => s.setSphereScore);

  const score = sphereScores[sphereId as SphereId];
  const savedGoal = sphereGoals[sphereId as SphereId];
  const [draft, setDraft] = useState<number | null>(score ?? null);
  const [goal, setGoal] = useState(savedGoal ?? "");
  const [testing, setTesting] = useState(false);

  const topics = topicsForSphere(sphereId as SphereId);
  const relatedContent = contentItems.filter((c) => topics.includes(c.topic));
  const relatedMentors = mentors.filter((m) =>
    m.topics.some((t) => topics.includes(t)),
  );
  const mentorNames = new Set(relatedMentors.map((m) => m.name));
  const relatedEvents = events.filter((e) => mentorNames.has(e.mentor));

  if (!known) {
    return (
      <div className="px-6 py-10 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Такая сфера не найдена.</p>
        <Link to="/profile" className="text-sm text-accent">
          Вернуться в профиль
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-8 pb-6">
      <Link
        to="/profile"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Колесо баланса
      </Link>

      {/* Header */}
      <section className="flex items-center gap-4">
        <span
          className="size-16 rounded-full flex items-center justify-center text-3xl shrink-0"
          style={{ background: sphere.color }}
        >
          {sphere.emoji}
        </span>
        <div>
          <h1 className="font-[Lora] text-2xl leading-tight">{sphere.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{sphere.description}</p>
        </div>
      </section>

      {/* Состояние + мини-тест */}
      <section className="bg-card ring-1 ring-border rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Состояние сейчас
            </span>
            <p className="font-[Lora] text-2xl mt-1">
              {score != null ? `${score} / 10` : "Ещё не оценивали"}
            </p>
          </div>
          {!testing && (
            <button
              onClick={() => {
                setDraft(score ?? 5);
                setTesting(true);
              }}
              className="text-xs font-medium text-accent border-b border-accent/30 pb-0.5"
            >
              {score != null ? "Пройти заново" : "Пройти тест"}
            </button>
          )}
        </div>

        {score != null && !testing && (
          <>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${score * 10}%`, background: sphere.color }}
              />
            </div>
            {savedGoal && (
              <div className="bg-cream/60 rounded-2xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Чтобы стало 10
                </p>
                <p className="text-sm mt-1 leading-relaxed">{savedGoal}</p>
              </div>
            )}
          </>
        )}

        {testing && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Где вы в этой сфере сегодня? Честно и без осуждения.
            </p>
            <Scale
              value={draft}
              onChange={setDraft}
              lowLabel="В начале"
              highLabel="Почти как хочу"
            />
            {draft != null && draft < 10 && (
              <div>
                <label htmlFor="sphere-goal" className="text-sm font-medium">
                  Что должно случиться, чтобы стало 10?
                </label>
                <textarea
                  id="sphere-goal"
                  name="sphere-goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                  autoCapitalize="none"
                  autoCorrect="on"
                  spellCheck
                  inputMode="text"
                  placeholder="Опишите своими словами — это станет вашим ориентиром"
                  style={{ textTransform: "none" }}
                  className="mt-2 w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setTesting(false)}
                className="flex-1 py-3 rounded-full text-sm ring-1 ring-border text-muted-foreground"
              >
                Отмена
              </button>
              <button
                disabled={draft == null}
                onClick={() => {
                  if (draft == null) return;
                  setSphereScore(
                    sphereId as SphereId,
                    draft,
                    draft < 10 ? goal.trim() : "",
                  );
                  setTesting(false);
                  toast.success("Отметили состояние сферы");
                }}
                className="flex-1 py-3 rounded-full text-sm font-medium bg-foreground text-primary-foreground disabled:opacity-40"
              >
                Сохранить
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Материалы */}
      {relatedContent.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="font-[Lora] text-xl">Материалы по теме</h2>
            <Link to="/topics" className="text-xs text-accent">
              Все темы
            </Link>
          </div>
          <div className="space-y-2">
            {relatedContent.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to="/topics"
                className="bg-card p-4 rounded-2xl ring-1 ring-border flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.author}
                    {c.duration ? ` · ${c.duration}` : ""}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Наставники */}
      {relatedMentors.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-[Lora] text-xl">Кто может помочь</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
            {relatedMentors.map((m) => (
              <Link
                key={m.id}
                to="/mentors/$mentorId"
                params={{ mentorId: m.id }}
                className="shrink-0 w-28 flex flex-col items-center text-center"
              >
                <div className="size-16 rounded-full bg-cream ring-1 ring-border/50 mb-2 overflow-hidden flex items-center justify-center text-xl">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span>👩‍⚕️</span>
                  )}
                </div>
                <span className="text-sm font-[Lora] leading-tight">{m.name}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {m.specialization}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Мероприятия */}
      {relatedEvents.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-[Lora] text-xl">Мероприятия</h2>
          <div className="space-y-2">
            {relatedEvents.map((e) => (
              <Link
                key={e.id}
                to="/events/$eventId"
                params={{ eventId: e.id }}
                className="bg-card p-4 rounded-2xl ring-1 ring-border flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.date.split(" ").slice(0, 2).join(" ")} · {e.time}
                  </p>
                </div>
                <Calendar className="size-4 text-accent shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedContent.length === 0 &&
        relatedMentors.length === 0 &&
        relatedEvents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Материалы по этой сфере скоро появятся.
          </p>
        )}
    </div>
  );
}
