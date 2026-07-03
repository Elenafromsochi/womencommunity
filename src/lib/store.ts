import { create } from "zustand";
import type {
  UserRole,
  UserProfile,
  DiagnosticResult,
  ProgressState,
  MarkerEntry,
  CycleData,
  CycleSymptomEntry,
  SphereId,
  JournalEntry,
  SphereScorePoint,
} from "./types";
import type { CloudState } from "./sync";
import { mockUser } from "./mock-data";
import { computeLevel, RETEST_INTERVAL_DAYS } from "./methodology";
import { defaultCycle, recomputeAvgCycleLength } from "./cycle";

const addDays = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

interface AppState {
  // ===== Синхронизация с облаком =====
  userId: string | null;
  hydrated: boolean;
  setUserId: (id: string | null) => void;
  /** Загрузить состояние из облака (перезаписывает данные пользователя). */
  hydrate: (state: Partial<CloudState> | null) => void;
  /** Сбросить состояние к дефолту (выход из аккаунта). */
  resetToDefaults: () => void;

  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;

  // ===== Ядро методики =====
  diagnostic: DiagnosticResult | null;
  progress: ProgressState | null;
  /** Сохранить результат диагностики и инициализировать прогресс (Уровень 1 · Старт). */
  saveDiagnostic: (result: DiagnosticResult) => void;
  /** Мягко отметить маркер. Уровень пересчитывается из числа отметок. */
  addMarkerEntry: (markerId: string, value: number) => void;
  /** Отметить точку благополучия (ретест раз в 2 недели). */
  logWellbeing: (value: number, isRetest?: boolean) => void;
  /** Сбросить ядро (повторная диагностика с нуля). */
  resetDiagnostic: () => void;
  notificationsRead: string[];
  markNotificationRead: (id: string) => void;
  savedContentIds: string[];
  toggleSavedContent: (id: string) => void;
  savedMentorIds: string[];
  toggleSavedMentor: (id: string) => void;
  registeredEventIds: string[];
  toggleEventRegistration: (id: string) => void;
  appliedGroupIds: string[];
  toggleGroupApplication: (id: string) => void;

  // ===== Женский цикл =====
  cycle: CycleData | null;
  /** Отметить начало месячных (YYYY-MM-DD). Пересчитывает среднюю длину цикла. */
  logPeriodStart: (dateISO: string) => void;
  /** Убрать ошибочно отмеченную дату начала. */
  removePeriodStart: (dateISO: string) => void;
  /** Записать/обновить дневную отметку самочувствия (по дате). */
  logCycleSymptom: (entry: CycleSymptomEntry) => void;

  // ===== Колесо баланса =====
  /** Оценка состояния по сферам 0–10 (мини-тесты со страницы сферы). */
  sphereScores: Partial<Record<SphereId, number>>;
  /** Цель по сфере: что нужно, чтобы стало 10. */
  sphereGoals: Partial<Record<SphereId, string>>;
  /** История оценок сфер — чтобы видеть динамику «было → стало». */
  sphereScoreHistory: SphereScorePoint[];
  setSphereScore: (sphereId: SphereId, score: number, goal?: string) => void;

  /** До 3 фокус-сфер. */
  focusSpheres: SphereId[];
  /** Переключить фокус на сфере. Не больше 3 — иначе не добавляет. */
  toggleFocusSphere: (sphereId: SphereId) => boolean;

  // ===== Дневник состояния =====
  journalEntries: JournalEntry[];
  addJournalEntry: (
    prompt: string,
    text: string,
    mood?: number,
    opts?: { sphereId?: SphereId; tags?: string[] },
  ) => void;
}

/** Максимум фокус-сфер. */
export const MAX_FOCUS_SPHERES = 3;

// Дефолтные значения данных пользователя (новый аккаунт до онбординга).
const defaultUserData = {
  onboardingComplete: false,
  role: "member" as UserRole,
  profile: mockUser,
  diagnostic: null as DiagnosticResult | null,
  progress: null as ProgressState | null,
  notificationsRead: [] as string[],
  savedContentIds: [] as string[],
  savedMentorIds: [] as string[],
  registeredEventIds: [] as string[],
  appliedGroupIds: [] as string[],
  cycle: null as CycleData | null,
  sphereScores: {} as Partial<Record<SphereId, number>>,
  sphereGoals: {} as Partial<Record<SphereId, string>>,
  sphereScoreHistory: [] as SphereScorePoint[],
  focusSpheres: [] as SphereId[],
  journalEntries: [] as JournalEntry[],
};

/** Извлечь сохраняемый в облако срез состояния. */
export function selectCloudState(s: AppState): CloudState {
  return {
    onboardingComplete: s.onboardingComplete,
    role: s.role,
    profile: s.profile,
    notificationsRead: s.notificationsRead,
    savedContentIds: s.savedContentIds,
    savedMentorIds: s.savedMentorIds,
    registeredEventIds: s.registeredEventIds,
    appliedGroupIds: s.appliedGroupIds,
    diagnostic: s.diagnostic,
    progress: s.progress,
    cycle: s.cycle,
    sphereScores: s.sphereScores,
    sphereGoals: s.sphereGoals,
    sphereScoreHistory: s.sphereScoreHistory,
    focusSpheres: s.focusSpheres,
    journalEntries: s.journalEntries,
  };
}

export const useAppStore = create<AppState>()((set, get) => ({
  userId: null,
  hydrated: false,
  setUserId: (id) => set({ userId: id }),
  hydrate: (state) =>
    set({
      ...defaultUserData,
      ...(state ?? {}),
      hydrated: true,
    }),
  resetToDefaults: () => set({ ...defaultUserData, hydrated: false, userId: null }),

  ...defaultUserData,
  setOnboardingComplete: (v) => set({ onboardingComplete: v }),
  setRole: (role) => set({ role }),
  updateProfile: (partial) =>
    set((state) => ({ profile: { ...state.profile, ...partial } })),

  saveDiagnostic: (result) => {
    const { level, title } = computeLevel(0);
    const progress: ProgressState = {
      level,
      levelTitle: title,
      markerEntries: [],
      wellbeingHistory: [{ date: result.date, value: result.wellbeing }],
      nextRetestDate: addDays(result.date, RETEST_INTERVAL_DAYS),
    };
    set({
      diagnostic: result,
      progress,
      sphereScores: { [result.supportSphere]: result.supportSphereScore },
    });
  },
  addMarkerEntry: (markerId, value) =>
    set((state) => {
      if (!state.progress) return state;
      const entry: MarkerEntry = {
        markerId,
        value,
        date: new Date().toISOString(),
      };
      const markerEntries = [...state.progress.markerEntries, entry];
      const { level, title } = computeLevel(markerEntries.length);
      return {
        progress: {
          ...state.progress,
          markerEntries,
          level,
          levelTitle: title,
        },
      };
    }),
  logWellbeing: (value, isRetest) =>
    set((state) => {
      if (!state.progress) return state;
      const now = new Date().toISOString();
      return {
        progress: {
          ...state.progress,
          wellbeingHistory: [
            ...state.progress.wellbeingHistory,
            { date: now, value, isRetest },
          ],
          nextRetestDate: isRetest
            ? addDays(now, RETEST_INTERVAL_DAYS)
            : state.progress.nextRetestDate,
        },
      };
    }),
  resetDiagnostic: () => set({ diagnostic: null, progress: null }),
  markNotificationRead: (id) =>
    set((state) => ({
      notificationsRead: state.notificationsRead.includes(id)
        ? state.notificationsRead
        : [...state.notificationsRead, id],
    })),
  toggleSavedContent: (id) =>
    set((state) => ({
      savedContentIds: state.savedContentIds.includes(id)
        ? state.savedContentIds.filter((x) => x !== id)
        : [...state.savedContentIds, id],
    })),
  toggleSavedMentor: (id) =>
    set((state) => ({
      savedMentorIds: state.savedMentorIds.includes(id)
        ? state.savedMentorIds.filter((x) => x !== id)
        : [...state.savedMentorIds, id],
    })),
  toggleEventRegistration: (id) =>
    set((state) => ({
      registeredEventIds: state.registeredEventIds.includes(id)
        ? state.registeredEventIds.filter((x) => x !== id)
        : [...state.registeredEventIds, id],
    })),
  toggleGroupApplication: (id) =>
    set((state) => ({
      appliedGroupIds: state.appliedGroupIds.includes(id)
        ? state.appliedGroupIds.filter((x) => x !== id)
        : [...state.appliedGroupIds, id],
    })),

  logPeriodStart: (dateISO) =>
    set((state) => {
      const base = state.cycle ?? defaultCycle();
      if (base.periods.some((p) => p.start === dateISO)) return state;
      const periods = [...base.periods, { start: dateISO }];
      return {
        cycle: {
          ...base,
          periods,
          avgCycleLength: recomputeAvgCycleLength(periods, base.avgCycleLength),
        },
      };
    }),
  removePeriodStart: (dateISO) =>
    set((state) => {
      if (!state.cycle) return state;
      const periods = state.cycle.periods.filter((p) => p.start !== dateISO);
      return {
        cycle: {
          ...state.cycle,
          periods,
          avgCycleLength: recomputeAvgCycleLength(periods, state.cycle.avgCycleLength),
        },
      };
    }),
  logCycleSymptom: (entry) =>
    set((state) => {
      const base = state.cycle ?? defaultCycle();
      const symptoms = [
        ...base.symptoms.filter((s) => s.date !== entry.date),
        entry,
      ].sort((a, b) => (a.date < b.date ? 1 : -1));
      return { cycle: { ...base, symptoms } };
    }),

  setSphereScore: (sphereId, score, goal) =>
    set((state) => {
      const prev = state.sphereScores[sphereId];
      // Записываем в историю только реальное изменение оценки.
      const history =
        prev === score
          ? state.sphereScoreHistory
          : [
              { date: new Date().toISOString(), sphereId, score },
              ...state.sphereScoreHistory,
            ];
      return {
        sphereScores: { ...state.sphereScores, [sphereId]: score },
        sphereScoreHistory: history,
        sphereGoals:
          goal !== undefined
            ? { ...state.sphereGoals, [sphereId]: goal }
            : state.sphereGoals,
      };
    }),

  toggleFocusSphere: (sphereId) => {
    const state = get();
    const has = state.focusSpheres.includes(sphereId);
    if (has) {
      set({ focusSpheres: state.focusSpheres.filter((x) => x !== sphereId) });
      return true;
    }
    if (state.focusSpheres.length >= MAX_FOCUS_SPHERES) return false;
    set({ focusSpheres: [...state.focusSpheres, sphereId] });
    return true;
  },

  journalEntries: [],
  addJournalEntry: (prompt, text, mood, opts) =>
    set((state) => ({
      journalEntries: [
        {
          id: `j${Date.now()}`,
          date: new Date().toISOString(),
          prompt,
          text,
          mood,
          sphereId: opts?.sphereId,
          tags: opts?.tags,
        },
        ...state.journalEntries,
      ],
    })),
}));
