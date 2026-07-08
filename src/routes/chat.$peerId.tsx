import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useAppStore } from "../lib/store";
import {
  fetchThread,
  sendMessage,
  currentUserId,
  type Message,
} from "../lib/chat";
import { VoiceInput } from "../components/VoiceInput";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$peerId")({
  validateSearch: (s: Record<string, unknown>) => ({
    name: typeof s.name === "string" ? s.name : "",
  }),
  head: () => ({ meta: [{ title: "Женское общество — Чат" }] }),
  component: ChatThread,
});

function ChatThread() {
  const { peerId } = Route.useParams();
  const { name } = Route.useSearch();
  const profile = useAppStore((s) => s.profile);
  const [myId, setMyId] = useState<string | null>(null);
  const [items, setItems] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async (id: string) => {
    const list = await fetchThread(id, peerId);
    setItems(list);
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }),
    );
  };

  useEffect(() => {
    currentUserId().then((id) => {
      setMyId(id);
      if (id) load(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerId]);

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await sendMessage(peerId, t, profile.name || "Участница");
      setText("");
      if (myId) await load(myId);
    } catch {
      toast.error("Не удалось отправить. Попробуйте позже.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-60px)]">
      <div className="px-6 pt-2 pb-3 flex items-center gap-3 border-b border-border">
        <Link to="/inbox" className="size-9 rounded-full bg-card flex items-center justify-center ring-1 ring-border">
          <ArrowLeft className="size-4" />
        </Link>
        <span className="font-[Lora] text-lg truncate">{name || "Диалог"}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Пока пусто. Напишите первое сообщение.
          </p>
        )}
        {items.map((m) => {
          const mine = m.sender_id === myId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] text-sm leading-relaxed rounded-2xl px-3.5 py-2.5 whitespace-pre-wrap break-words ${
                  mine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card ring-1 ring-border rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-3 border-t border-border space-y-2">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            autoCapitalize="sentences"
            autoCorrect="on"
            inputMode="text"
            placeholder="Сообщение…"
            style={{ textTransform: "none" }}
            className="flex-1 bg-card border border-border rounded-2xl px-4 py-2.5 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none resize-none"
          />
          <button
            onClick={send}
            disabled={busy || !text.trim()}
            className="size-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
            aria-label="Отправить"
          >
            <Send className="size-4" />
          </button>
        </div>
        <VoiceInput onResult={(t) => setText((p) => (p ? `${p} ${t}` : t))} />
      </div>
    </div>
  );
}
