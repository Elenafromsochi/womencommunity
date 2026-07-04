import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { askAssistant, type AssistantMessage, type AssistantContext } from "../lib/assistant";
import { renderWithLinks } from "../lib/assistant-links";
import { VoiceInput } from "./VoiceInput";

/** Тёплый ИИ-помощник (YandexGPT через Яндекс Cloud Function). */
export function AssistantChat({
  context,
  seed,
}: {
  context: AssistantContext;
  /** Готовое сообщение (например, «обсудить запись дневника») — отправится само. */
  seed?: string;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const lastSeed = useRef<string | undefined>(undefined);

  const sendText = async (raw: string) => {
    const text = raw.trim();
    if (!text || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    let sent: AssistantMessage[] = [];
    setMessages((prev) => {
      sent = [...prev, { role: "user" as const, text }];
      return sent;
    });
    const { reply, error } = await askAssistant(sent, context);
    setMessages([...sent, { role: "assistant", text: error ?? reply ?? "Я рядом." }]);
    busyRef.current = false;
    setBusy(false);
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }),
    );
  };

  const send = () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    void sendText(text);
  };

  // Пришёл готовый вопрос (обсудить запись дневника) — отправляем один раз.
  useEffect(() => {
    if (seed && seed !== lastSeed.current) {
      lastSeed.current = seed;
      void sendText(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  return (
    <section className="bg-primary text-primary-foreground rounded-[2rem] p-5 space-y-3">
      <div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
          Помощник
        </span>
        <h2 className="font-[Lora] text-lg mt-1">Бережная поддержка рядом</h2>
      </div>

      {messages.length > 0 && (
        <div ref={scrollRef} className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm leading-relaxed rounded-2xl px-3.5 py-2.5 ${
                m.role === "user"
                  ? "bg-primary-foreground/15 ml-6"
                  : "bg-primary-foreground/5 mr-6"
              }`}
            >
              {m.role === "assistant" ? renderWithLinks(m.text) : m.text}
            </div>
          ))}
          {busy && (
            <div className="bg-primary-foreground/5 mr-6 rounded-2xl px-3.5 py-2.5 text-sm text-primary-foreground/60">
              печатает…
            </div>
          )}
        </div>
      )}

      {messages.length === 0 && (
        <p className="text-sm text-primary-foreground/75 leading-relaxed">
          Расскажите, как вы. Я выслушаю и мягко подскажу, опираясь на ваши сферы и
          состояние.
        </p>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
          placeholder="Напишите здесь…"
          style={{ textTransform: "none" }}
          className="flex-1 bg-primary-foreground/10 rounded-2xl px-4 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none resize-none normal-case"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="size-10 shrink-0 rounded-full bg-primary-foreground text-foreground flex items-center justify-center disabled:opacity-40"
          aria-label="Отправить"
        >
          <Send className="size-4" />
        </button>
      </div>
      <VoiceInput
        onResult={(t) => setInput((prev) => (prev ? `${prev} ${t}` : t))}
      />
      <p className="text-[10px] text-primary-foreground/40 leading-relaxed">
        Это ИИ, не врач. В трудные моменты он мягко направит к живым специалистам.
      </p>
    </section>
  );
}
