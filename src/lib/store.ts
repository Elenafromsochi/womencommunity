import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserRole,
  UserProfile,
  DiagnosticResult,
  ProgressState,
  MarkerEntry,
} from "./types";
import { mockUser } from "./mock-data";
import { computeLevel, RETEST_INTERVAL_DAYS } from "./methodology";

const addDays = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

interface AppState {
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingComplete: true,
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      role: "member",
      setRole: (role) => set({ role }),
      profile: mockUser,
      updateProfile: (partial) =>
        set((state) => ({ profile: { ...state.profile, ...partial } })),

      diagnostic: null,
      progress: null,
      saveDiagnostic: (result) => {
        const { level, title } = computeLevel(0);
        const progress: ProgressState = {
          level,
          levelTitle: title,
          markerEntries: [],
          wellbeingHistory: [{ date: result.date, value: result.wellbeing }],
          nextRetestDate: addDays(result.date, RETEST_INTERVAL_DAYS),
        };
        set({ diagnostic: result, progress });
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
      notificationsRead: [],
      markNotificationRead: (id) =>
        set((state) => ({
          notificationsRead: state.notificationsRead.includes(id)
            ? state.notificationsRead
            : [...state.notificationsRead, id],
        })),
      savedContentIds: [],
      toggleSavedContent: (id) =>
        set((state) => ({
          savedContentIds: state.savedContentIds.includes(id)
            ? state.savedContentIds.filter((x) => x !== id)
            : [...state.savedContentIds, id],
        })),
      savedMentorIds: [],
      toggleSavedMentor: (id) =>
        set((state) => ({
          savedMentorIds: state.savedMentorIds.includes(id)
            ? state.savedMentorIds.filter((x) => x !== id)
            : [...state.savedMentorIds, id],
        })),
      registeredEventIds: [],
      toggleEventRegistration: (id) =>
        set((state) => ({
          registeredEventIds: state.registeredEventIds.includes(id)
            ? state.registeredEventIds.filter((x) => x !== id)
            : [...state.registeredEventIds, id],
        })),
      appliedGroupIds: [],
      toggleGroupApplication: (id) =>
        set((state) => ({
          appliedGroupIds: state.appliedGroupIds.includes(id)
            ? state.appliedGroupIds.filter((x) => x !== id)
            : [...state.appliedGroupIds, id],
        })),
    }),
    { name: "zhenskoe-obshchestvo-store" }
  )
);
