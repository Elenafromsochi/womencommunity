import { supabase } from "./supabase";

// Отклики (комментарии) к материалам — общие для всех участниц.
// Требуется таблица material_comments в Supabase (SQL — в supabase/schema).

export interface MaterialComment {
  id: string;
  material_id: string;
  user_id: string;
  author: string;
  text: string;
  created_at: string;
}

export async function fetchComments(materialId: string): Promise<MaterialComment[]> {
  const { data, error } = await supabase
    .from("material_comments")
    .select("*")
    .eq("material_id", materialId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchComments:", error.message);
    return [];
  }
  return (data as MaterialComment[]) ?? [];
}

export async function addComment(
  materialId: string,
  text: string,
  author: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("material_comments").insert({
    material_id: materialId,
    user_id: user?.id,
    author,
    text,
  });
  if (error) throw new Error(error.message);
}

export async function deleteComment(id: string): Promise<void> {
  await supabase.from("material_comments").delete().eq("id", id);
}
