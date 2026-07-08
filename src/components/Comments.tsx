import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { useAppStore } from "../lib/store";
import {
  fetchComments,
  addComment,
  deleteComment,
  type MaterialComment,
} from "../lib/comments";
import { VoiceInput } from "./VoiceInput";
import { toast } from "sonner";

/** Отклики к материалу — комментарии участниц. */
export function Comments({ materialId }: { materialId: string }) {
  const profile = useAppStore((s) => s.profile);
  const [items, setItems] = useState<MaterialComment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setItems(await fetchComments(materialId));
    setLoading(false);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await addComment(materialId, t, profile.name || "Участница");
      setText("");
      await load();
    } catch {
      toast.error("Не получилось отправить. Попробуйте позже.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="font-[Lora] text-xl">
        Отклики{items.length > 0 ? ` · ${items.length}` : ""}
      </h2>

      {!loading && items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Пока нет откликов. Будьте первой — поделитесь, как вам материал.
        </p>
      )}

      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="bg-card ring-1 ring-border rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{c.author}</p>
              <span className="text-[11px] text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <p className="text-sm mt-1 leading-relaxed">{c.text}</p>
            {c.user_id && profile && (
              <button
                onClick={async () => {
                  await deleteComment(c.id);
                  await load();
                }}
                className="mt-2 text-[11px] text-muted-foreground/60 hover:text-rose inline-flex items-center gap-1"
              >
                <Trash2 className="size-3" />
                удалить
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-cream rounded-2xl ring-1 ring-border p-3 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          autoCapitalize="sentences"
          autoCorrect="on"
          inputMode="text"
          placeholder="Ваш отклик — тепло и по-человечески"
          style={{ textTransform: "none" }}
          className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <div className="flex items-center justify-between gap-2">
          <VoiceInput onResult={(t) => setText((p) => (p ? `${p} ${t}` : t))} />
          <button
            onClick={send}
            disabled={busy || !text.trim()}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full disabled:opacity-40"
          >
            <Send className="size-4" />
            Отправить
          </button>
        </div>
      </div>
    </section>
  );
}
