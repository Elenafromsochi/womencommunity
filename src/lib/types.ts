export type UserRole = "member" | "mentor" | "curator" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  age: number;
  maritalStatus: string;
  occupation: string;
  /** Короткий рассказ о себе (редактируется участницей). */
  about?: string;
  interests: string[];
  priorities: string[];
  avatar?: string;
  role: UserRole;
}

export interface Mentor {
  id: string;
  name: string;
  specialization: string;
  description: string;
  topics: string[];
  rating: number;
  reviews: number;
  materialsCount: number;
  events: EventPreview[];
  groups: GroupPreview[];
  avatar?: string;
  experience: string;
  /** Ссылка/способ связи (телеграм, почта, сайт) — если задан, показываем «Связаться». */
  contact?: string;
  /** ID пользователя-эксперта (для чата внутри приложения). */
  userId?: string;
}

/** Экспертная страница наставника (как её видят участницы). Заполняется в кабинете. */
export interface ExpertProfile {
  specialization?: string;
  tagline?: string; // короткое описание
  offer?: string; // чем могу помочь / услуги
  about?: string; // подробнее об опыте
  contact?: string; // как связаться
  topics?: string[];
  published?: boolean; // показывать участницам
}

export interface Event {
  id: string;
  title: string;
  mentor: string;
  date: string;
  time: string;
  description: string;
  spots: number;
  spotsTotal: number;
  type: "online" | "offline";
  price: number;
  cover?: string;
  location?: string;
  /** Ссылка на оплату (ЮKassa, Продамус, телеграм-бот…) для платных событий. */
  paymentUrl?: string;
  /** Если задан — это мастермайнд из общей базы (оплата через платформу, сплит эксперту). */
  mastermindId?: string;
}

export type EventPreview = Omit<Event, "spots" | "spotsTotal" | "description" | "location">;

export interface Group {
  id: string;
  title: string;
  description: string;
  curator: string;
  spots: number;
  spotsTotal: number;
  startDate: string;
  duration: string;
  cover?: string;
  avatar?: string;
}

export type GroupPreview = Pick<Group, "id" | "title" | "startDate">;

export type ContentType = "article" | "audio" | "video" | "practice" | "collection";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  topic: string;
  description: string;
  /** Полный текст материала (абзацы). */
  body?: string[];
  author: string;
  duration?: string;
  cover?: string;
  /** Ссылка на аудио/видео (YouTube, Rutube, VK, Яндекс Музыка, прямой файл…). */
  mediaUrl?: string;
  date: string;
}

/** Статус материала в общей базе: на модерации / опубликован / отклонён. */
export type MaterialStatus = "pending" | "approved" | "rejected";

/** Материал из общей базы с полями модерации (для кабинета эксперта и админа). */
export interface MaterialRecord extends ContentItem {
  status: MaterialStatus;
  authorId: string;
  rejectReason?: string;
}

export interface Review {
  id: string;
  author: string;
  text: string;
  rating: number; // 1–5
  date: string;
}

export interface Topic {
  id: string;
  name: string;
  emoji: string;
  description: string;
  contentCount: number;
}

export interface Notification {
  id: string;
  type: "material" | "reply" | "message" | "event" | "group" | "reminder";
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface ChatAttachment {
  type: "link";
  url: string;
  label?: string;
}

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  attachments?: ChatAttachment[];
  status?: MessageStatus;
  readBy?: string[];
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar?: string;
  title: string;
  content: string;
  type: "introduction" | "news" | "discussion";
  date: string;
  likes: number;
  comments: number;
}

// ============================================================================
// ЯДРО МЕТОДИКИ — неизменный контракт (см. CLAUDE.md, раздел 1).
// Конкретное наполнение (вопросы, библиотека маркеров, правило уровня) живёт
// в lib/methodology.ts и может меняться без правки этих типов и экранов.
// ============================================================================

/**
 * 6 сфер-лепестков колеса. «Состояние» — не лепесток, а ЦЕНТР (см. STATE_SPHERE
 * в methodology.ts): общий пульс 0–10, на который влияют остальные сферы.
 */
export type SphereId =
  | "body"
  | "relationships"
  | "home"
  | "finance"
  | "work"
  | "rest";

export interface Sphere {
  id: SphereId;
  name: string;
  /** Короткая подпись для секторов колеса баланса */
  short: string;
  emoji: string;
  description: string;
  /** Цвет лепестка в венке (CSS-строка) */
  color: string;
}

/** Типы маркеров: факт-событие | число | шкала 0–10 | частота */
export type MarkerKind = "event" | "number" | "scale" | "frequency";

export interface MarkerDef {
  id: string;
  sphereId: SphereId;
  label: string;
  kind: MarkerKind;
  /** Единица для number/frequency (напр. «ч», «раз/нед») */
  unit?: string;
  min?: number;
  max?: number;
  /** Хребтовый маркер (субъективная шкала благополучия 0–10) */
  isBackbone?: boolean;
}

/** Мягкая отметка значения маркера. event → 0/1; scale → 0–10; number/frequency → число */
export interface MarkerEntry {
  markerId: string;
  value: number;
  date: string; // ISO
}

export interface WellbeingPoint {
  date: string; // ISO
  value: number; // 0–10
  isRetest?: boolean;
}

/** Результат входной диагностики «знакомство с собой» (раздел 3 CLAUDE.md) */
export interface DiagnosticResult {
  date: string; // ISO
  energy: number; // ресурс 0–10
  agency: number; // агентность 0–10 (саморефлексия, не оценка)
  selectedSpheres: SphereId[];
  supportSphere: SphereId; // опорная сфера
  supportSphereScore: number; // шкала в опорной сфере 0–10
  chosenMarkers: string[]; // 1–2 выбранных маркера
  wellbeing: number; // хребтовая шкала благополучия 0–10
}

/**
 * Прогресс участницы. ИНВАРИАНТ: уровень растёт ВМЕСТЕ с маркерами
 * (реальные сдвиги), а НЕ за активность/просмотры/время в приложении.
 */
export interface ProgressState {
  level: number;
  levelTitle: string;
  markerEntries: MarkerEntry[];
  wellbeingHistory: WellbeingPoint[];
  nextRetestDate: string; // ISO, +14 дней — мягкая отметка динамики
}

// ============================================================================
// Женский цикл — мягкий трекер (даты, симптомы, подсказка о фазе).
// Ориентир для саморефлексии, не медицинская точность.
// ============================================================================

export type FlowLevel = "none" | "light" | "medium" | "heavy";

export interface PeriodLog {
  start: string; // дата начала, "YYYY-MM-DD"
  end?: string;
}

/** Дневная отметка самочувствия в контексте цикла (уникальна по дате). */
export interface CycleSymptomEntry {
  date: string; // "YYYY-MM-DD"
  flow?: FlowLevel;
  tags: string[];
  note?: string;
}

export interface CycleData {
  periods: PeriodLog[];
  avgCycleLength: number; // средняя длина цикла, дней
  avgPeriodLength: number; // средняя длительность месячных, дней
  symptoms: CycleSymptomEntry[];
}

/** Запись дневника состояния. */
export interface JournalEntry {
  id: string;
  date: string; // ISO
  prompt: string; // вопрос, на который отвечала
  text: string;
  mood?: number; // 0–10, необязательно
  /** Сфера, к которой относится запись (если создана из переоценки сферы). */
  sphereId?: SphereId;
  /** Теги записи: сфера + выявленные по ключевым словам. */
  tags?: string[];
}

/** Точка в истории оценок сферы — чтобы видеть динамику «было → стало». */
export interface SphereScorePoint {
  date: string; // ISO
  sphereId: SphereId;
  score: number; // 0–10
}

/**
 * Шаг пути — конкретное действие к цели сферы. Большая цель (sphereGoals)
 * декомпозируется на такие шаги; из активных шагов складывается «Ваш путь».
 * Это реальные действия, а НЕ активность в приложении — без стриков и очков.
 */
export interface PathStepItem {
  id: string;
  sphereId: SphereId;
  text: string; // что сделать
  recurring: boolean; // повторяющийся (регулярный) или разовый
  done: boolean; // для разового — выполнен
  createdAt: string; // ISO
  doneAt?: string; // ISO, когда отмечен разовый
  /** Для повторяющегося — дата последнего выполнения "YYYY-MM-DD". */
  lastDoneAt?: string;
  /** Если шаг = изучить материал клуба. */
  materialId?: string;
}
