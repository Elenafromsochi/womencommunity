import { supabase } from "./supabase";
import { useAppStore } from "./store";
import type { ContentItem, ContentType, MaterialRecord, MaterialStatus } from "./types";

// Общая база материалов клуба + модерация.
// Эксперт публикует материал → он ложится в таблицу materials со статусом
// 'pending'. Администратор одобряет/отклоняет. Одобренные видят все участницы.
// Роль администратора живёт в таблице admins (не в клиентском состоянии), так
// что модерацию нельзя обойти переключением роли в приложении.

interface MaterialRow {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  type: string;
  topic: string;
  description: string;
  body: string[] | null;
  duration: string | null;
  media_url: string | null;
  cover: string | null;
  status: string;
  reject_reason: string | null;
  created_at: string;
}

/** Красивая дата «8 июля» из ISO. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function rowToRecord(r: MaterialRow): MaterialRecord {
  return {
    id: r.id,
    title: r.title,
    type: r.type as ContentType,
    topic: r.topic,
    description: r.description,
    body: r.body ?? undefined,
    author: r.author_name,
    duration: r.duration ?? undefined,
    mediaUrl: r.media_url ?? undefined,
    cover: r.cover ?? undefined,
    date: formatDate(r.created_at),
    status: r.status as MaterialStatus,
    authorId: r.author_id,
    rejectReason: r.reject_reason ?? undefined,
  };
}

export interface NewMaterialInput {
  authorId: string;
  authorName: string;
  title: string;
  type: ContentType;
  topic: string;
  description: string;
  body?: string[];
  duration?: string;
  mediaUrl?: string;
  cover?: string;
}

/** Опубликовать материал — попадает на модерацию (status pending). */
export async function insertMaterial(input: NewMaterialInput): Promise<{ error?: string }> {
  const { error } = await supabase.from("materials").insert({
    author_id: input.authorId,
    author_name: input.authorName,
    title: input.title,
    type: input.type,
    topic: input.topic,
    description: input.description,
    body: input.body ?? null,
    duration: input.duration ?? null,
    media_url: input.mediaUrl ?? null,
    cover: input.cover ?? null,
    status: "pending",
  });
  return error ? { error: error.message } : {};
}

/** Одобренные материалы — их видят все участницы в ленте. */
export async function fetchApprovedMaterials(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchApprovedMaterials:", error.message);
    return [];
  }
  return (data as MaterialRow[]).map(rowToRecord);
}

/** Материалы текущего эксперта (любой статус) — для его кабинета. */
export async function fetchMyMaterials(userId: string): Promise<MaterialRecord[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchMyMaterials:", error.message);
    return [];
  }
  return (data as MaterialRow[]).map(rowToRecord);
}

/** Материалы на модерации — для администратора (RLS отдаст их только админу). */
export async function fetchPendingMaterials(): Promise<MaterialRecord[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchPendingMaterials:", error.message);
    return [];
  }
  return (data as MaterialRow[]).map(rowToRecord);
}

/** Одобрить/отклонить материал (только администратор). */
export async function moderateMaterial(
  id: string,
  status: "approved" | "rejected",
  reason?: string,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("materials")
    .update({ status, reject_reason: reason ?? null })
    .eq("id", id);
  return error ? { error: error.message } : {};
}

/** Удалить материал (свой — эксперт, любой — админ). */
export async function deleteMaterial(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  return error ? { error: error.message } : {};
}

/** Я — администратор? (есть ли моя строка в таблице admins). */
export async function checkIsAdmin(): Promise<boolean> {
  const { data } = await supabase.from("admins").select("user_id").maybeSingle();
  return Boolean(data);
}

/**
 * Загрузить общие материалы в стор: одобренные (для ленты) и свои (для кабинета).
 * Вызывается при входе и после публикации/модерации.
 */
export async function loadSharedMaterials(userId: string): Promise<void> {
  const [approved, mine] = await Promise.all([
    fetchApprovedMaterials(),
    fetchMyMaterials(userId),
  ]);
  const st = useAppStore.getState();
  st.setApprovedMaterials(approved);
  st.setMyMaterialRecords(mine);
}
