import { sphereById } from "./methodology";
import type {
  DiagnosticResult,
  PathStepItem,
  ProgressState,
  SphereId,
} from "./types";

// «Ваш путь» — правило «следующего шага». Детерминированно, из данных участницы.
// Путь ведёт по РЕАЛЬНЫМ шагам, на которые декомпозирована цель сферы.
// Одна вещь за раз, без стриков и бейджей. После роста — перекрёсток из 3 дверей.

export interface PathDoor {
  title: string;
  hint: string;
  to: string;
  params?: Record<string, string>;
}

export interface PathStep {
  kind: "step" | "crossroads";
  /** Короткая строчка «пройдено». */
  trail: string;
  title: string;
  hint: string;
  cta?: string;
  to?: string;
  params?: Record<string, string>;
  doors?: PathDoor[];
}

interface PathInput {
  diagnostic: DiagnosticResult | null;
  focusSpheres: SphereId[];
  sphereScores: Partial<Record<SphereId, number>>;
  sphereGoals: Partial<Record<SphereId, string>>;
  steps: PathStepItem[];
  progress: ProgressState | null;
}

/** Активен ли шаг сейчас: разовый — не выполнен; повторяющийся — не сделан сегодня. */
export function isStepActive(st: PathStepItem, today: string): boolean {
  return st.recurring ? st.lastDoneAt !== today : !st.done;
}

export function computeNextStep(s: PathInput): PathStep {
  const today = new Date().toISOString().slice(0, 10);
  const focusNames = s.focusSpheres.map((id) => sphereById(id).name);
  const grownSphere = s.focusSpheres.find((id) => (s.sphereScores[id] ?? 0) >= 8);

  const trailParts: string[] = [];
  if (s.diagnostic) trailParts.push("знакомство ✓");
  if (focusNames.length) trailParts.push(`фокус: ${focusNames.join(", ")}`);
  const trail = trailParts.join(" · ");

  // 1. Нет диагностики
  if (!s.diagnostic) {
    return {
      kind: "step",
      trail,
      title: "Познакомьтесь с собой",
      hint: "Короткое знакомство с собой — пара минут. С него начинается путь.",
      cta: "Начать",
      to: "/onboarding",
    };
  }

  // 2. Нет фокуса
  if (s.focusSpheres.length === 0) {
    return {
      kind: "step",
      trail,
      title: "Выберите, на чём фокус",
      hint: "Отметьте в колесе 1–3 сферы, на которых сейчас хочется упор (★).",
      cta: "К колесу баланса",
      to: "/profile",
    };
  }

  const primary = s.focusSpheres[0];
  const primaryName = sphereById(primary).name;

  // 3. Пора свериться (ретест раз в 2 недели)
  if (s.progress && Date.now() >= Date.parse(s.progress.nextRetestDate)) {
    return {
      kind: "step",
      trail,
      title: "Пора мягко свериться",
      hint: "Прошло около двух недель. Переоцените фокус-сферы — увидите, как двигаетесь.",
      cta: "Свериться",
      to: "/profile",
    };
  }

  // 4. Сфера окрепла → перекрёсток
  if (grownSphere) {
    const name = sphereById(grownSphere).name;
    return {
      kind: "crossroads",
      trail,
      title: `Сфера «${name}» окрепла 🌿`,
      hint: "Здорово! Куда хочется дальше?",
      doors: [
        {
          title: "Поднять планку",
          hint: "Новая цель и шаг в этой же сфере",
          to: "/sphere/$sphereId",
          params: { sphereId: grownSphere },
        },
        {
          title: "Сместить фокус",
          hint: "Перенести внимание на другую сферу",
          to: "/profile",
        },
        {
          title: "Взять поддержку глубже",
          hint: "Группа сопровождения, мастермайнд или эксперт",
          to: "/events",
        },
      ],
    };
  }

  // 5. Есть активный шаг в фокус-сферах → ведём по нему (одна вещь за раз)
  const focusSet = new Set(s.focusSpheres);
  const active = s.focusSpheres.flatMap((id) =>
    s.steps.filter((st) => st.sphereId === id && isStepActive(st, today)),
  );
  if (focusSet.size && active.length) {
    const next = active[0];
    const name = sphereById(next.sphereId).name;
    return {
      kind: "step",
      trail,
      title: "Ваш шаг сегодня",
      hint: `«${name}»: ${next.text}`,
      cta: "Открыть сферу",
      to: "/sphere/$sphereId",
      params: { sphereId: next.sphereId },
    };
  }

  // 6. Нет большой цели в главной фокус-сфере
  if (!s.sphereGoals[primary]) {
    return {
      kind: "step",
      trail,
      title: `Цель в сфере «${primaryName}»`,
      hint: "Что должно случиться, чтобы стало 10? Запишите большую цель — от неё вырастут шаги.",
      cta: "Задать цель",
      to: "/sphere/$sphereId",
      params: { sphereId: primary },
    };
  }

  // 7. Цель есть, но не разбита на шаги
  const primarySteps = s.steps.filter((st) => st.sphereId === primary);
  if (!primarySteps.length) {
    return {
      kind: "step",
      trail,
      title: "Разбейте цель на первый шаг",
      hint: `«${primaryName}»: ${s.sphereGoals[primary]}. Какое маленькое действие приблизит к ней? Добавьте первый шаг.`,
      cta: "Добавить шаг",
      to: "/sphere/$sphereId",
      params: { sphereId: primary },
    };
  }

  // 8. Все шаги на сегодня сделаны — мягкая пауза
  return {
    kind: "step",
    trail,
    title: "Шаги на сегодня сделаны 🌿",
    hint: `Вы двигаетесь в сфере «${primaryName}». Можно отдохнуть — или добавить следующий шаг.`,
    cta: "Открыть сферу",
    to: "/sphere/$sphereId",
    params: { sphereId: primary },
  };
}
