import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, UserProfile } from "./types";
import { mockUser } from "./mock-data";

interface AppState {
  // Auth / Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;

  // Role
  role: UserRole;
  setRole: (role: UserRole) => void;

  // User Profile
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;

  // Notifications
  notificationsRead: string[];
  markNotificationRead: (id: string) => void;

  // Saved content
  savedContentIds: string[];
  toggleSavedContent: (id: string) => void;

  // Saved mentors
  savedMentorIds: string[];
  toggleSavedMentor: (id: string) => void;

  // Event registrations
  registeredEventIds: string[];
  toggleEventRegistration: (id: string) => void;

  // Group applications
  appliedGroupIds: string[];
  toggleGroupApplication: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),

      role: "member",
      setRole: (role) => set({ role }),

      profile: mockUser,
      updateProfile: (partial) =>
        set((state) => ({
          profile: { ...state.profile, ...partial },
        })),

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
    {
      name: "zhenskoe-obshchestvo-store",
    }
  )
);
