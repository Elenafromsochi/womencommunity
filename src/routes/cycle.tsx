import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Droplet, Trash2, Check } from "lucide-react";
import { useAppStore } from "../lib/store";
import {
  computeCycleStatus,
  todayISO,
  SYMPTOM_TAGS,
  FLOW_OPTIONS,
} from "../lib/cycle";
import type { FlowLevel } from "../lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/cycle")({
  head: () => ({
    meta: [
      { title: "Женское общество — Мой цикл" },
      { name: "description", content: "Мягкий трекер женского цикла" },
    ],
  }),
  component: CyclePage,
});

const fmt = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

function CyclePage() {
  const cycle = useAppStore((s) => s.cycle);
  const logPeriodStart = useAppStore((s) => s.logPeriodStart);
  const removePeriodStart = useAppStore((s) => s.removePeriodStart);

  const today = todayISO();
  const hasData = !!cycle && cycle.periods.length > 0;

  return (
    <div className="px-6 space-y-8 pb-6">
      <section>
        <h1 className="font-[Lora] text-3xl leading-tight">Мой цикл</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Мягко наблюдаем за собой — без диагнозов и оценок.
        </p>
      </section>

      {!hasData ? (
        <FirstTime onSave={(d) => logPeriodStart(d)} today={today} />
      ) : (
        <>
          <StatusCard />
          <LogPeriod today={today} onSave={(d) => logPeriodStart(d)} />
          <TodayWellbeing today={today} />
          <History onRemove={removePeriodStart} />
        </>
      )}

      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
        Расчёты фазы и следующих месячных — ориентировочные и зависят от того, что
        вы отмечаете. Это не медицинский сервис.
      </p>
    </div>
  );
}

function FirstTime({
  onSave,
  today,
}: {
  onSave: (d: string) => void;
  today: string;
}) {
  const [date, setDate] = useState(today);
  return (
    <div className="bg-cream rounded-[2rem] p-6 ring-1 ring-border text-center space-y-4">
      <span className="text-4xl">🌙</span>
      <div>
        <h2 className="font-[Lora] text-xl">Когда начались последние месячные?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          С этого начнём. Дату всегда можно поправить.
        </p>
      </div>
      <input
        type="date"
        value={date}
        max={today}
        onChange={(e) => setDate(e.target.value)}
        className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        onClick={() => {
          onSave(date);
          toast.success("Дата сохранена");
        }}
        className="w-full bg-foreground text-primary-foreground text-sm font-medium py-3.5 rounded-full"
      >
        Сохранить
      </button>
    </div>
  );
}

function StatusCard() {
  const cycle = useAppStore((s) => s.cycle)!;
  const status = computeCycleStatus(cycle, todayISO());
  if (!status.lastStart) return null;

  const nextText =
    status.daysUntilNext == null
      ? ""
      : status.daysUntilNext > 0
        ? `через ${status.daysUntilNext} ${plural(status.daysUntilNext, "день", "дня", "дней")}`
        : status.daysUntilNext === 0
          ? "ожидаются сегодня"
          : `задержка ${Math.abs(status.daysUntilNext)} ${plural(Math.abs(status.daysUntilNext), "день", "дня", "дней")}`;

  return (
    <div className="bg-card rounded-[2rem] p-6 ring-1 ring-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-primary/80 font-medium">
            {status.phaseLabel}
          </span>
          {status.cycleDay != null && (
            <h2 className="font-[Lora] text-2xl leading-tight mt-1">
              День цикла {status.cycleDay}
            </h2>
          )}
        </div>
        <div className="size-14 rounded-full bg-rose/15 flex items-center justify-center text-2xl">
          🌸
        </div>
      </div>
      {status.phaseHint && (
        <p className="text-sm text-muted-foreground">{status.phaseHint}</p>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">Следующие месячные</span>
        <span className="text-sm font-medium">
          {status.nextStart ? fmt(status.nextStart) : "—"}
          {nextText && (
            <span className="text-muted-foreground font-normal"> · {nextText}</span>
          )}
        </span>
      </div>
    </div>
  );
}

function LogPeriod({
  today,
  onSave,
}: {
  today: string;
  onSave: (d: string) => void;
}) {
  const [date, setDate] = useState(today);
  return (
    <section className="space-y-3">
      <h2 className="font-[Lora] text-xl">Отметить начало месячных</h2>
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={() => {
            onSave(date);
            toast.success("Отмечено");
          }}
          className="shrink-0 inline-flex items-center gap-1.5 bg-rose/15 text-rose text-sm font-medium px-4 rounded-2xl"
        >
          <Droplet className="size-4" />
          Отметить
        </button>
      </div>
    </section>
  );
}

function TodayWellbeing({ today }: { today: string }) {
  const cycle = useAppStore((s) => s.cycle);
  const logCycleSymptom = useAppStore((s) => s.logCycleSymptom);
  const existing = cycle?.symptoms.find((s) => s.date === today);

  const [flow, setFlow] = useState<FlowLevel | undefined>(existing?.flow);
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <section className="space-y-3">
      <h2 className="font-[Lora] text-xl">Как вы сегодня?</h2>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Выделения</p>
        <div className="flex gap-2">
          {FLOW_OPTIONS.map((opt) => {
            const active = flow === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFlow(active ? undefined : opt.value)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  active
                    ? "bg-rose/20 text-rose border-rose/40"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Самочувствие</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_TAGS.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => {
          logCycleSymptom({ date: today, flow, tags });
          toast.success("Сохранено на сегодня");
        }}
        className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-primary-foreground text-sm font-medium py-3.5 rounded-full"
      >
        <Check className="size-4" />
        Сохранить
      </button>
    </section>
  );
}

function History({ onRemove }: { onRemove: (d: string) => void }) {
  const cycle = useAppStore((s) => s.cycle)!;
  const starts = [...cycle.periods.map((p) => p.start)].sort((a, b) =>
    a < b ? 1 : -1,
  );
  if (starts.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-[Lora] text-xl">История</h2>
      <div className="space-y-2">
        {starts.map((s) => (
          <div
            key={s}
            className="bg-card p-4 rounded-2xl ring-1 ring-border flex items-center justify-between"
          >
            <span className="text-sm flex items-center gap-2">
              <Droplet className="size-4 text-rose" />
              {fmt(s)}
            </span>
            <button
              onClick={() => onRemove(s)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Удалить"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
