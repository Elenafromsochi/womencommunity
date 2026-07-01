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
export const SPHERES: Sphere[] = [
  { id: "relationships", name: "Отношения", emoji: "💞", description: "Партнёр, семья, близость, границы", color: "hsl(350 60% 72%)" },
  { id: "health", name: "Здоровье", emoji: "🌿", description: "Тело, сон, движение, энергия", color: "hsl(145 32% 60%)" },
  { id: "finance", name: "Финансы", emoji: "🪙", description: "Деньги, опора, независимость", color: "hsl(45 55% 62%)" },
  { id: "self_realization", name: "Самореализация", emoji: "✨", description: "Дело, призвание, цели", color: "hsl(280 35% 70%)" },
  { id: "emotions", name: "Эмоции", emoji: "🫧", description: "Состояние, чувства, устойчивость", color: "hsl(210 48% 70%)" },
  { id: "motherhood", name: "Материнство", emoji: "🤱", description: "Дети, баланс, поддержка", color: "hsl(20 58% 73%)" },
  { id: "creativity", name: "Творчество", emoji: "🎨", description: "Хобби, ремёсла, самовыражение", color: "hsl(320 45% 73%)" },
  { id: "growth", name: "Личностный рост", emoji: "🌸", description: "Самопознание, осознанность", color: "hsl(165 36% 62%)" },
  { id: "environment", name: "Окружение", emoji: "🤝", description: "Люди вокруг, среда, поддержка", color: "hsl(95 38% 62%)" },
];

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
  sphereId: "emotions",
  label: "Шкала благополучия",
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
  // Отношения
  { id: "rel_quality_time", sphereId: "relationships", label: "Тёплый разговор с близким", kind: "frequency", unit: "раз/нед" },
  { id: "rel_boundary", sphereId: "relationships", label: "Обозначила свою границу", kind: "event" },
  { id: "rel_closeness", sphereId: "relationships", label: "Ощущение близости", kind: "scale", min: 0, max: 10 },

  // Здоровье
  { id: "health_sleep", sphereId: "health", label: "Часы сна", kind: "number", unit: "ч" },
  { id: "health_walk", sphereId: "health", label: "Прогулки", kind: "frequency", unit: "раз/нед" },
  { id: "health_energy", sphereId: "health", label: "Уровень энергии", kind: "scale", min: 0, max: 10 },

  // Финансы
  { id: "fin_track", sphereId: "finance", label: "Заметила свои траты", kind: "event" },
  { id: "fin_save", sphereId: "finance", label: "Отложила на себя", kind: "frequency", unit: "раз/мес" },
  { id: "fin_calm", sphereId: "finance", label: "Спокойствие про деньги", kind: "scale", min: 0, max: 10 },

  // Самореализация
  { id: "self_step", sphereId: "self_realization", label: "Шаг к своей цели", kind: "event" },
  { id: "self_focus", sphereId: "self_realization", label: "Часы на своё дело", kind: "number", unit: "ч/нед" },
  { id: "self_meaning", sphereId: "self_realization", label: "Чувство смысла", kind: "scale", min: 0, max: 10 },

  // Эмоции
  { id: "emo_pause", sphereId: "emotions", label: "Заметила своё состояние", kind: "frequency", unit: "раз/день" },
  { id: "emo_steady", sphereId: "emotions", label: "Эмоциональная устойчивость", kind: "scale", min: 0, max: 10 },

  // Материнство
  { id: "mom_presence", sphereId: "motherhood", label: "Время с ребёнком без спешки", kind: "frequency", unit: "раз/нед" },
  { id: "mom_self", sphereId: "motherhood", label: "Время для себя", kind: "event" },
  { id: "mom_balance", sphereId: "motherhood", label: "Баланс «я и роль мамы»", kind: "scale", min: 0, max: 10 },

  // Творчество
  { id: "creo_make", sphereId: "creativity", label: "Что-то создала", kind: "frequency", unit: "раз/нед" },
  { id: "creo_flow", sphereId: "creativity", label: "Ощущение потока", kind: "scale", min: 0, max: 10 },

  // Личностный рост
  { id: "grow_reflect", sphereId: "growth", label: "Минуты рефлексии/дневник", kind: "frequency", unit: "раз/нед" },
  { id: "grow_intention", sphereId: "growth", label: "Выполнила намерение дня", kind: "event" },
  { id: "grow_aware", sphereId: "growth", label: "Ясность про себя", kind: "scale", min: 0, max: 10 },

  // Окружение
  { id: "env_support", sphereId: "environment", label: "Опёрлась на поддержку", kind: "event" },
  { id: "env_new", sphereId: "environment", label: "Новое тёплое знакомство", kind: "frequency", unit: "раз/мес" },
  { id: "env_belong", sphereId: "environment", label: "Чувство «я среди своих»", kind: "scale", min: 0, max: 10 },
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
