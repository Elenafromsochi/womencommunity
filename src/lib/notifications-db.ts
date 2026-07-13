import { supabase } from "./supabase";
import { useAppStore } from "./store";

// Уведомления пользователя (из Supabase). Создаются триггерами на модерации;
// клиент только читает свои и отмечает прочитанными.

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

function toNotification(r: NotificationRow): AppNotification {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    link: r.link ?? undefined,
    read: r.read,
    createdAt: r.created_at,
  };
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("fetchNotifications:", error.message);
    return [];
  }
  return (data as NotificationRow[]).map(toNotification);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", userId)
    .eq("read", false);
  if (error) console.error("markAllNotificationsRead:", error.message);
}

/** Загрузить уведомления в стор (при входе и после действий). */
export async function loadNotifications(userId: string): Promise<void> {
  const items = await fetchNotifications(userId);
  useAppStore.getState().setInbox(items);
}
