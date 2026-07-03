import { sphereById } from "./methodology";
import type { DiagnosticResult, ProgressState, SphereId } from "./types";

// «Ваш путь» — правило «следующего шага». Детерминированно, из данных участницы.
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
  progress: ProgressState | null;
}

export function computeNextStep(s: PathInput): PathStep {
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

  // 5. Нет цели в главной фокус-сфере
  if (!s.sphereGoals[primary]) {
    return {
      kind: "step",
      trail,
      title: `Цель в сфере «${primaryName}»`,
      hint: "Ответьте себе: что должно случиться, чтобы стало 10? Это станет ориентиром.",
      cta: "Задать ориентир",
      to: "/sphere/$sphereId",
      params: { sphereId: primary },
    };
  }

  // 6. Дневной шаг по умолчанию
  return {
    kind: "step",
    trail,
    title: "Ваш маленький шаг сегодня",
    hint: `Загляните в сферу «${primaryName}»: отметьте состояние или прочитайте один материал.`,
    cta: "Открыть сферу",
    to: "/sphere/$sphereId",
    params: { sphereId: primary },
  };
}
