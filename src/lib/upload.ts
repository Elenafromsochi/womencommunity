import { supabase } from "./supabase";

// Загрузка файла в Supabase Storage (бакет "materials") и получение публичной ссылки.
// Бакет должен быть создан в дашборде Supabase как public (см. supabase/README-storage).

const BUCKET = "materials";

/** Загрузить файл, вернуть публичную ссылку. Бросает ошибку с понятным текстом. */
export async function uploadFile(file: File, folder = "misc"): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  // Уникальный путь без Date.now() ради читаемости — используем случайную часть из имени + размер.
  const path = `${folder}/${Math.abs(hashString(safeName + file.size))}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    cacheControl: "3600",
    contentType: file.type || undefined,
  });
  if (error) {
    throw new Error(
      error.message.includes("Bucket not found")
        ? "Хранилище ещё не настроено (нет бакета «materials» в Supabase)."
        : `Не удалось загрузить файл: ${error.message}`,
    );
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
