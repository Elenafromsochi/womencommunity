import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Heart, Wind } from "lucide-react";
import { useAppStore } from "../lib/store";
import { STATE_SPHERE, STATE_TOPICS, sphereById } from "../lib/methodology";
import { computeCycleStatus, todayISO } from "../lib/cycle";
import { contentItems } from "../lib/mock-data";
import type { SphereId } from "../lib/types";
import { Scale } from "../components/Scale";
import { AssistantChat } from "../components/AssistantChat";
import { toast } from "sonner";

export const Route = createFileRoute("/state")({
  head: () => ({ meta: [{ title: "Женское общество — Состояние" }] }),
  component: StatePage,
});

const SOS = [
  { icon: <Wind className="size-4" />, title: "Дыхание 4–7–8", text: "Вдох на 4 счёта → задержка на 7 → медленный выдох на 8. Повторите 4 раза. Нервная система мягко успокаивается." },
  { icon: <Heart className="size-4" />, title: "Рука на сердце", text: "Положите ладонь на грудь, почувствуйте тепло и биение. Скажите себе: «Мне сейчас трудно, и я с собой». Побудьте так минуту." },
  { icon: <Sparkles className="size-4" />, title: "Опора: 5–4–3–2–1", text: "Назовите 5 вещей, что видите, 4 — что слышите, 3 — что чувствуете телом, 2 запаха, 1 вкус. Возвращает в «здесь и сейчас»." },
];

const FOCUS_PROMPT: Record<SphereId, string> = {
  body: "Что сегодня почувствовали в теле — что дало сил, а что забрало?",
  relationships: "Какой момент с близкими сегодня был тёплым? А что кольнуло?",
  home: "Что в доме сегодня добавило уюта — или, наоборот, напрягло?",
  finance: "Какие мысли о деньгах приходили сегодня? Что за ними — тревога или спокойствие?",
  work: "Что в деле сегодня зажгло, а что вымотало?",
  rest: "Успели ли вы сегодня выдохнуть? Что наполнило бы вас прямо сейчас?",
};

function pickPrompt(focus: SphereId[], phase: string | null, state?: number): string {
  const prompts: string[] = [];
  if (state != null && state <= 4)
    prompts.push("Что сейчас просит вашего внимания? Что было бы бережно сделать для себя сегодня?");
  if (phase === "menstrual" || phase === "luteal")
    prompts.push("Тело просит замедлиться. Где сегодня можно было отпустить «надо»?");
  focus.forEach((f) => prompts.push(FOCUS_PROMPT[f]));
  prompts.push("Как вы сегодня? Что хочется сказать себе?");
  const idx = new Date().getDate() % prompts.length;
  return prompts[idx];
}

function StatePage() {
  const progress = useAppStore((s) => s.progress);
  const diagnostic = useAppStore((s) => s.diagnostic);
  const logWellbeing = useAppStore((s) => s.logWellbeing);
  const focusSpheres = useAppStore((s) => s.focusSpheres);
  const cycle = useAppStore((s) => s.cycle);
  const journalEntries = useAppStore((s) => s.journalEntries);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);

  const stateScore = progress?.wellbeingHistory?.at(-1)?.value ?? diagnostic?.wellbeing;
  const phase =
    cycle && cycle.periods.length > 0
      ? computeCycleStatus(cycle, todayISO()).phase
      : null;

  const [rating, setRating] = useState<number | null>(null);
  const [openSos, setOpenSos] = useState<number | null>(null);
  const prompt = pickPrompt(focusSpheres, phase, stateScore);
  const [journal, setJournal] = useState("");

  const practices = contentItems.filter((c) => STATE_TOPICS.includes(c.topic)).slice(0, 4);

  const phaseLabel =
    cycle && cycle.periods.length > 0
      ? computeCycleStatus(cycle, todayISO()).phaseLabel
      : null;
  const assistantContext = {
    focus: focusSpheres.map((id) => sphereById(id).name),
    state: stateScore ?? null,
    phase: phaseLabel,
    materials: practices.map((c) => ({ id: c.id, title: c.title, topic: c.topic })),
  };

  return (
    <div className="px-6 space-y-8 pb-8">
      <Link to="/profile" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Профиль
      </Link>

      {/* Пульс */}
      <section className="bg-card ring-1 ring-border rounded-[2rem] p-6 space-y-4 text-center">
        <span className="text-4xl">{STATE_SPHERE.emoji}</span>
        <div>
          <h1 className="font-[Lora] text-2xl">Состояние</h1>
          <p className="text-sm text-muted-foreground mt-1">Как вы сейчас внутри</p>
        </div>
        {stateScore != null && (
          <p className="font-[Lora] text-4xl">{stateScore}<span className="text-lg text-muted-foreground">/10</span></p>
        )}
        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-3">Отметить прямо сейчас:</p>
          <Scale value={rating} onChange={setRating} lowLabel="Тяжело" highLabel="Хорошо" />
          <button
            disabled={rating == null}
            onClick={() => {
              if (rating == null) return;
              logWellbeing(rating);
              setRating(null);
              toast.success("Отметили состояние");
            }}
            className="mt-3 w-full bg-foreground text-primary-foreground text-sm font-medium py-3 rounded-full disabled:opacity-40"
          >
            Сохранить
          </button>
        </div>
      </section>

      {/* Быстрая поддержка */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Быстрая поддержка</h2>
        <p className="text-xs text-muted-foreground -mt-1">Если накрыло — сделайте одно из этого прямо сейчас.</p>
        <div className="space-y-2">
          {SOS.map((s, i) => (
            <button
              key={i}
              onClick={() => setOpenSos(openSos === i ? null : i)}
              className="w-full text-left bg-rose/10 ring-1 ring-rose/20 rounded-2xl p-4"
            >
              <span className="flex items-center gap-2 text-rose font-medium text-sm">
                {s.icon}
                {s.title}
              </span>
              {openSos === i && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.text}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Дневник */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Дневник состояния</h2>
        <div className="bg-cream rounded-[2rem] p-5 ring-1 ring-border space-y-3">
          <p className="text-sm font-medium leading-relaxed">{prompt}</p>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            rows={4}
            autoCapitalize="sentences"
            autoCorrect="on"
            spellCheck
            inputMode="text"
            placeholder="Пишите как есть — для себя, без правил"
            style={{ textTransform: "none" }}
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <button
            disabled={!journal.trim()}
            onClick={() => {
              addJournalEntry(prompt, journal.trim(), stateScore);
              setJournal("");
              toast.success("Записано в дневник");
            }}
            className="w-full bg-foreground text-primary-foreground text-sm font-medium py-3 rounded-full disabled:opacity-40"
          >
            Записать
          </button>
        </div>

        {journalEntries.length > 0 && (
          <div className="space-y-2">
            {journalEntries.slice(0, 5).map((e) => (
              <div key={e.id} className="bg-card ring-1 ring-border rounded-2xl p-4">
                <p className="text-[11px] text-muted-foreground">
                  {new Date(e.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                </p>
                <p className="text-xs text-muted-foreground italic mt-1">{e.prompt}</p>
                <p className="text-sm mt-1.5 leading-relaxed">{e.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Практики для состояния */}
      {practices.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-[Lora] text-xl">Практики для состояния</h2>
          <div className="space-y-2">
            {practices.map((c) => (
              <Link
                key={c.id}
                to="/material/$id"
                params={{ id: c.id }}
                className="bg-card p-4 rounded-2xl ring-1 ring-border flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.author}{c.duration ? ` · ${c.duration}` : ""}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ИИ-помощник */}
      <AssistantChat context={assistantContext} />
    </div>
  );
}
