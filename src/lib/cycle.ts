import type { CycleData, FlowLevel, PeriodLog } from "./types";

// Мягкий трекер женского цикла. Все расчёты — ориентировочные.

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export const SYMPTOM_TAGS = [
  "Спазмы",
  "Усталость",
  "Головная боль",
  "Чувствительность груди",
  "Вздутие",
  "Раздражительность",
  "Тяга к сладкому",
  "Хорошее настроение",
  "Много энергии",
  "Хочется покоя",
];

export const FLOW_OPTIONS: { value: FlowLevel; label: string }[] = [
  { value: "light", label: "Мажет" },
  { value: "medium", label: "Умеренно" },
  { value: "heavy", label: "Обильно" },
];

const DAY_MS = 86_400_000;

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const addDaysISO = (iso: string, n: number): string => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const dayDiff = (from: string, to: string): number =>
  Math.round(
    (Date.parse(to + "T00:00:00") - Date.parse(from + "T00:00:00")) / DAY_MS,
  );

/** Даты начала месячных по убыванию (свежие сверху). */
export const sortedStarts = (periods: PeriodLog[]): string[] =>
  periods.map((p) => p.start).sort((a, b) => (a < b ? 1 : -1));

/** Пересчитать среднюю длину цикла по интервалам между месячными. */
export function recomputeAvgCycleLength(periods: PeriodLog[], fallback: number): number {
  const starts = [...periods.map((p) => p.start)].sort();
  if (starts.length < 2) return fallback;
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) gaps.push(dayDiff(starts[i - 1], starts[i]));
  const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  return Math.min(40, Math.max(21, avg)); // мягкие границы
}

export const defaultCycle = (): CycleData => ({
  periods: [],
  avgCycleLength: DEFAULT_CYCLE_LENGTH,
  avgPeriodLength: DEFAULT_PERIOD_LENGTH,
  symptoms: [],
});

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal" | "overdue";

export interface CycleStatus {
  lastStart: string | null;
  cycleDay: number | null;
  phase: CyclePhase | null;
  phaseLabel: string;
  phaseHint: string;
  nextStart: string | null;
  daysUntilNext: number | null;
  cycleLength: number;
}

const PHASE_META: Record<CyclePhase, { label: string; hint: string }> = {
  menstrual: { label: "Месячные", hint: "Время бережного отдыха и тепла." },
  follicular: { label: "Фолликулярная фаза", hint: "Энергия растёт — хорошее время для нового." },
  ovulation: { label: "Овуляция", hint: "Пик сил и открытости." },
  luteal: { label: "Лютеиновая фаза", hint: "Замедляемся, прислушиваемся к себе." },
  overdue: { label: "Ждём месячные", hint: "Возможно, цикл чуть сдвинулся — это бывает." },
};

/** Рассчитать текущий статус цикла на дату `today` (YYYY-MM-DD). */
export function computeCycleStatus(cycle: CycleData, today: string): CycleStatus {
  const cycleLength = cycle.avgCycleLength || DEFAULT_CYCLE_LENGTH;
  const starts = sortedStarts(cycle.periods);
  const lastStart = starts[0] ?? null;

  if (!lastStart) {
    return {
      lastStart: null,
      cycleDay: null,
      phase: null,
      phaseLabel: "",
      phaseHint: "",
      nextStart: null,
      daysUntilNext: null,
      cycleLength,
    };
  }

  const cycleDay = dayDiff(lastStart, today) + 1;
  const nextStart = addDaysISO(lastStart, cycleLength);
  const daysUntilNext = dayDiff(today, nextStart);

  const ovulationDay = cycleLength - 14;
  let phase: CyclePhase;
  if (cycleDay > cycleLength + 1) phase = "overdue";
  else if (cycleDay <= cycle.avgPeriodLength) phase = "menstrual";
  else if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) phase = "ovulation";
  else if (cycleDay < ovulationDay - 1) phase = "follicular";
  else phase = "luteal";

  return {
    lastStart,
    cycleDay,
    phase,
    phaseLabel: PHASE_META[phase].label,
    phaseHint: PHASE_META[phase].hint,
    nextStart,
    daysUntilNext,
    cycleLength,
  };
}
