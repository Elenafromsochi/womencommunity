// ============================================================================
// КОНФИГ МЕТОДИКИ — «сменная» часть продукта.
//
// Здесь живёт всё, что будет итерироваться по мере прояснения методики:
// формулировки диагностики, библиотека маркеров по сферам, правило расчёта
// уровня. Экраны и модель данных (types.ts) на это не завязаны жёстко —
// меняем данные здесь, каркас и принципы (CLAUDE.md, раздел 1) стоят.
// ============================================================================

import type { MarkerDef, Sphere, SphereId } from "./types";

// ---------------------------------------------------------------------------
// 9 сфер жизни (венок). Единый источник правды.
// ---------------------------------------------------------------------------
// 6 сфер-лепестков колеса. «Состояние» — отдельно (центр), см. STATE_SPHERE.
export const SPHERES: Sphere[] = [
  { id: "body", name: "Тело и здоровье", short: "Тело", emoji: "🌸", description: "Цикл, энергия, сон, самочувствие тела", color: "hsl(145 34% 60%)" },
  { id: "relationships", name: "Близкие и отношения", short: "Близкие", emoji: "💞", description: "Муж, дети, семья, подруги", color: "hsl(350 60% 72%)" },
  { id: "home", name: "Дом и быт", short: "Дом", emoji: "🏡", description: "Пространство, уют, комфорт жизни", color: "hsl(28 58% 68%)" },
  { id: "finance", name: "Финансы", short: "Финансы", emoji: "🪙", description: "Доход, активы, опора, уверенность в завтра", color: "hsl(45 55% 62%)" },
  { id: "work", name: "Дело и реализация", short: "Дело", emoji: "✨", description: "Работа, карьера, таланты, рост", color: "hsl(280 35% 70%)" },
  { id: "rest", name: "Отдых и восстановление", short: "Отдых", emoji: "🍃", description: "Сон, паузы, хобби, наполнение", color: "hsl(190 40% 62%)" },
];

/** «Состояние» — центр колеса: душевное «как я внутри» + общий пульс 0–10. */
export const STATE_SPHERE = {
  id: "state" as const,
  name: "Состояние",
  short: "Состояние",
  emoji: "💗",
  description: "Как я внутри — общий пульс вашего трека",
  color: "hsl(340 55% 72%)",
};

export const sphereById = (id: SphereId): Sphere =>
  SPHERES.find((s) => s.id === id) ?? SPHERES[0];

// ---------------------------------------------------------------------------
// Диагностика «знакомство с собой» (CLAUDE.md, раздел 3).
// Тексты вопросов вынесены сюда — их легко переписывать.
// ---------------------------------------------------------------------------
export const DIAGNOSTIC_COPY = {
  energy: {
    title: "Сколько в вас сейчас ресурса?",
    hint: "Без оценки — просто как чувствуете сегодня.",
    low: "Почти пусто",
    high: "Полна сил",
  },
  agency: {
    title: "Насколько сейчас вы — автор своей жизни?",
    hint: "Это саморефлексия, а не экзамен. Честный ответ важнее «правильного».",
    low: "Несёт течением",
    high: "Веду сама",
  },
  spheres: {
    title: "Какие сферы для вас сейчас живые?",
    hint: "Выберите те, что откликаются. Их можно менять в любой момент.",
  },
  support: {
    title: "Какая из них — опорная?",
    hint: "Та, развитие которой сейчас важнее всего и потянет за собой остальные.",
  },
  sphereScale: {
    title: "Где вы в этой сфере сегодня?",
    hint: "Шкала 0–10. Это точка отсчёта, не приговор.",
    low: "В начале",
    high: "Почти как хочу",
  },
  markers: {
    title: "Что будем мягко отмечать?",
    hint: "Выберите 1–2 маркера. Прогресс растёт вместе с ними — с реальными сдвигами.",
  },
  wellbeing: {
    title: "Как вам в целом по жизни сейчас?",
    hint: "Хребтовая шкала благополучия 0–10. К ней мы будем мягко возвращаться раз в 2 недели.",
    low: "Тяжело",
    high: "Хорошо",
  },
} as const;

// ---------------------------------------------------------------------------
// Хребтовый маркер — субъективная шкала благополучия 0–10 (обязательный).
// ---------------------------------------------------------------------------
export const BACKBONE_MARKER: MarkerDef = {
  id: "wellbeing",
  sphereId: "body",
  label: "Состояние (как я внутри)",
  kind: "scale",
  min: 0,
  max: 10,
  isBackbone: true,
};

// ---------------------------------------------------------------------------
// Библиотека маркеров по сферам. Мягкие, без чувствительной точности.
// Участница выбирает их сама (CLAUDE.md, раздел 1).
// ---------------------------------------------------------------------------
export const MARKER_LIBRARY: MarkerDef[] = [
  // Тело и здоровье
  { id: "body_sleep", sphereId: "body", label: "Часы сна", kind: "number", unit: "ч" },
  { id: "body_walk", sphereId: "body", label: "Прогулки", kind: "frequency", unit: "раз/нед" },
  { id: "body_energy", sphereId: "body", label: "Уровень энергии", kind: "scale", min: 0, max: 10 },

  // Близкие и отношения
  { id: "rel_quality_time", sphereId: "relationships", label: "Тёплый разговор с близким", kind: "frequency", unit: "раз/нед" },
  { id: "rel_boundary", sphereId: "relationships", label: "Обозначила свою границу", kind: "event" },
  { id: "rel_closeness", sphereId: "relationships", label: "Ощущение близости", kind: "scale", min: 0, max: 10 },

  // Дом и быт
  { id: "home_cozy", sphereId: "home", label: "Сделала дом уютнее", kind: "event" },
  { id: "home_order", sphereId: "home", label: "Навела порядок", kind: "frequency", unit: "раз/нед" },
  { id: "home_comfort", sphereId: "home", label: "Дома спокойно и хорошо", kind: "scale", min: 0, max: 10 },

  // Финансы
  { id: "fin_track", sphereId: "finance", label: "Заметила свои траты", kind: "event" },
  { id: "fin_save", sphereId: "finance", label: "Отложила на себя", kind: "frequency", unit: "раз/мес" },
  { id: "fin_calm", sphereId: "finance", label: "Спокойствие про деньги", kind: "scale", min: 0, max: 10 },

  // Дело и реализация
  { id: "work_step", sphereId: "work", label: "Шаг к своей цели", kind: "event" },
  { id: "work_focus", sphereId: "work", label: "Часы на своё дело", kind: "number", unit: "ч/нед" },
  { id: "work_meaning", sphereId: "work", label: "Чувство смысла в деле", kind: "scale", min: 0, max: 10 },

  // Отдых и восстановление
  { id: "rest_pause", sphereId: "rest", label: "Настоящая пауза для себя", kind: "frequency", unit: "раз/нед" },
  { id: "rest_joy", sphereId: "rest", label: "Занялась тем, что радует", kind: "event" },
  { id: "rest_full", sphereId: "rest", label: "Чувство наполненности", kind: "scale", min: 0, max: 10 },
];

export const markersForSphere = (sphereId: SphereId): MarkerDef[] =>
  MARKER_LIBRARY.filter((m) => m.sphereId === sphereId);

export const markerById = (id: string): MarkerDef | undefined =>
  id === BACKBONE_MARKER.id
    ? BACKBONE_MARKER
    : MARKER_LIBRARY.find((m) => m.id === id);

// ---------------------------------------------------------------------------
// Уровень. ИНВАРИАНТ: считается ТОЛЬКО из отметок маркеров (реальных сдвигов),
// никогда из активности/времени/просмотров. Пороги — сменная часть.
// ---------------------------------------------------------------------------
export const LEVELS = [
  { level: 1, title: "Старт", minEntries: 0 },
  { level: 2, title: "Первые шаги", minEntries: 5 },
  { level: 3, title: "Ритм", minEntries: 15 },
  { level: 4, title: "Опора", minEntries: 35 },
  { level: 5, title: "Расцвет", minEntries: 70 },
] as const;

/** Уровень по числу отметок маркеров. Возвращает {level, title}. */
export function computeLevel(markerEntryCount: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const l of LEVELS) {
    if (markerEntryCount >= l.minEntries) current = l;
  }
  return { level: current.level, title: current.title };
}

/** Сколько отметок до следующего уровня (null — максимум достигнут). */
export function entriesToNextLevel(markerEntryCount: number): number | null {
  const next = LEVELS.find((l) => l.minEntries > markerEntryCount);
  return next ? next.minEntries - markerEntryCount : null;
}

/** Период ретеста — мягкая отметка динамики раз в 2 недели. */
export const RETEST_INTERVAL_DAYS = 14;

// ---------------------------------------------------------------------------
// Связь сфер с темами контента (для страницы сферы: материалы, наставники).
// Названия соответствуют topics/mentors.topics в mock-data.
// ---------------------------------------------------------------------------
const SPHERE_TOPIC_ALIASES: Record<SphereId, string[]> = {
  body: ["Здоровье"],
  relationships: ["Отношения", "Материнство"],
  home: ["Личностный рост"],
  finance: ["Финансы"],
  work: ["Самореализация"],
  rest: ["Хобби", "Развлечения"],
};

export const topicsForSphere = (id: SphereId): string[] =>
  SPHERE_TOPIC_ALIASES[id] ?? [];

/** Темы для центра «Состояние» — практики и материалы на состояние. */
export const STATE_TOPICS = ["Личностный рост", "Здоровье"];

/**
 * Общее «Состояние» (центр колеса) — среднее арифметическое из твоего
 * самочувствия (пульс) и оценок всех сфер. Учитываются только заполненные
 * значения; если ничего нет — null. Результат округляется до 0.1.
 */
export function computeOverallState(
  pulse: number | null | undefined,
  sphereScores: Partial<Record<SphereId, number>>,
): number | null {
  const vals: number[] = [];
  if (pulse != null) vals.push(pulse);
  for (const s of SPHERES) {
    const v = sphereScores[s.id];
    if (v != null) vals.push(v);
  }
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}
