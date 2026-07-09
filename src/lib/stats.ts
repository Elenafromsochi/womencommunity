import { supabase } from "./supabase";

// Сводная статистика платформы для владельца/администратора.
// Считается на сервере (функция platform_stats, SECURITY DEFINER), потому что
// из соображений приватности клиент не может читать чужие строки напрямую.
// Вызвать функцию может только администратор (проверка is_admin внутри).

export interface PlatformStats {
  // Люди
  members_total: number;
  new_7d: number;
  experts_total: number;
  // Контент
  materials_total: number;
  materials_pending: number;
  materials_approved: number;
  // Активность
  active_7d: number;
  journal_total: number;
  steps_done: number;
  // Платное
  paid_events: number;
  registrations_total: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats | null> {
  const { data, error } = await supabase.rpc("platform_stats");
  if (error) {
    console.error("platform_stats:", error.message);
    return null;
  }
  return data as PlatformStats;
}
