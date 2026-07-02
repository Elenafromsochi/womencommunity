import { supabase } from "./supabase";
import type {
  CycleData,
  DiagnosticResult,
  ProgressState,
  SphereId,
  UserProfile,
  UserRole,
} from "./types";

// Срез состояния приложения, который сохраняется в облаке по аккаунту.
// Хранится как одна JSONB-строка на пользователя в таблице user_state —
// это даёт полную персистентность всех данных участницы между устройствами.
export interface CloudState {
  onboardingComplete: boolean;
  role: UserRole;
  profile: UserProfile;
  notificationsRead: string[];
  savedContentIds: string[];
  savedMentorIds: string[];
  registeredEventIds: string[];
  appliedGroupIds: string[];
  diagnostic: DiagnosticResult | null;
  progress: ProgressState | null;
  cycle: CycleData | null;
  /** Субъективная оценка состояния по каждой сфере (0–10), из мини-тестов. */
  sphereScores: Partial<Record<SphereId, number>>;
}

/** Загрузить состояние пользователя из облака. null — строки ещё нет (новый аккаунт). */
export async function loadCloudState(userId: string): Promise<CloudState | null> {
  const { data, error } = await supabase
    .from("user_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("loadCloudState error:", error.message);
    return null;
  }
  return (data?.state as CloudState) ?? null;
}

/** Сохранить (upsert) состояние пользователя в облако. */
export async function saveCloudState(userId: string, state: CloudState): Promise<void> {
  const { error } = await supabase
    .from("user_state")
    .upsert(
      { user_id: userId, state, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) console.error("saveCloudState error:", error.message);
}
