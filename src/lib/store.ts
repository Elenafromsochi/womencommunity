import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, UserProfile } from "./types";
import { mockUser } from "./mock-data";

interface AppState {
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
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
