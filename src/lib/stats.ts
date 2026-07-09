import { supabase } from "./supabase";

// Сводная статистика платформы для владельца/администратора.
// Считается на сервере (функция platform_stats, SECURITY DEFINER), потому что
// из соображений приватности клиент не может читать чужие строки напрямую.
// Вызвать функцию может только администратор (проверка is_admin внутри).

export interface PlatformStats {
  members_total: number;
  new_7d: number;
  experts_total: number;
  materials_total: number;
  materials_pending: number;
  materials_approved: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats | null> {
  const { data, error } = await supabase.rpc("platform_stats");
  if (error) {
    console.error("platform_stats:", error.message);
    return null;
  }
  return data as PlatformStats;
}
