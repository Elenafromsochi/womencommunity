import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Link as LinkIcon, Check, CheckCheck, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ChatAttachment, ChatMessage, MessageStatus } from "../lib/types";

interface ChatViewProps {
  initialMessages: ChatMessage[];
  storageKey?: string;
  participants?: string[];
  placeholder?: string;
}

const URL_RE = /(https?:\/\/[^\s]+|\/[a-zA-Z0-9/_$-]+)/g;

function extractLinks(text: string): ChatAttachment[] {
  const matches = text.match(URL_RE) ?? [];
  return matches.map((url) => ({ type: "link" as const, url }));
}

function StatusIcon({ status }: { status?: MessageStatus }) {
  if (!status) return null;
  if (status === "sending")
    return <span className="text-[10px] opacity-60">…</span>;
  if (status === "sent") return <Check className="size-3 opacity-60" />;
  if (status === "delivered") return <CheckCheck className="size-3 opacity-60" />;
  return <CheckCheck className="size-3 text-sage" />;
}

function AttachmentChip({ att }: { att: ChatAttachment }) {
  const isInternal = att.url.startsWith("/");
  const display = att.label ?? att.url;
  const content = (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 break-all">
      <LinkIcon className="size-3 shrink-0" />
      {display}
    </span>
  );
  return (
    <div className="mt-2 px-3 py-2 rounded-2xl bg-background/40 ring-1 ring-border/50">
      {isInternal ? (
        <Link to={att.url}>{content}</Link>
      ) : (
        <a href={att.url} target="_blank" rel="noreferrer">{content}</a>
      )}
    </div>
  );
}

export function ChatView({
  initialMessages,
  storageKey,
  participants = [],
  placeholder = "Написать сообщение…",
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (storageKey && typeof window !== "undefined") {
      try {
        const cached = window.localStorage.getItem(storageKey);
        if (cached) return JSON.parse(cached) as ChatMessage[];
      } catch {}
    }
    return initialMessages;
  });
  const [text, setText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const updateMessage = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const send = () => {
    const value = text.trim();
    if (!value && pendingAttachments.length === 0) return;
    const autoLinks = extractLinks(value);
    const all = [...pendingAttachments, ...autoLinks];
    const id = `m${Date.now()}`;
    const newMsg: ChatMessage = {
      id,
      author: "Вы",
      text: value,
      timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      attachments: all.length ? all : undefined,
      status: "sending",
      readBy: [],
    };
    setMessages((prev) => [...prev, newMsg]);
    setText("");
    setPendingAttachments([]);

    // Mock delivery / read receipts
    setTimeout(() => updateMessage(id, { status: "sent" }), 400);
    setTimeout(() => updateMessage(id, { status: "delivered" }), 1200);
    setTimeout(
      () => updateMessage(id, { status: "read", readBy: participants.slice(0, 2) }),
      2600,
    );
  };

  const promptLink = () => {
    const url = window.prompt("Вставьте ссылку (https://… или /events/e1)");
    if (!url) return;
    const label = window.prompt("Подпись (необязательно)") || undefined;
    setPendingAttachments((prev) => [...prev, { type: "link", url, label }]);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}>
            {!msg.isMe && (
              <div className="size-8 rounded-full bg-cream overflow-hidden shrink-0 flex items-center justify-center text-xs">
                {msg.avatar ? (
                  <img src={msg.avatar} alt={msg.author} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span>👩</span>
                )}
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-2.5 rounded-[1.5rem] text-sm leading-relaxed ${
                msg.isMe
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card ring-1 ring-border rounded-tl-sm"
              }`}
            >
              {!msg.isMe && (
                <p className="text-[10px] opacity-70 mb-0.5 font-medium">{msg.author}</p>
              )}
              {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
              {msg.attachments?.map((att, i) => <AttachmentChip key={i} att={att} />)}
              <div
                className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                  msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.isMe && <StatusIcon status={msg.status} />}
              </div>
              {msg.isMe && msg.status === "read" && msg.readBy && msg.readBy.length > 0 && (
                <p className="text-[10px] text-primary-foreground/60 mt-0.5 text-right">
                  Прочитано: {msg.readBy.slice(0, 2).join(", ")}
                  {msg.readBy.length > 2 ? ` и ещё ${msg.readBy.length - 2}` : ""}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {pendingAttachments.length > 0 && (
        <div className="px-5 pb-2 flex flex-wrap gap-2">
          {pendingAttachments.map((att, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 bg-card ring-1 ring-border rounded-full px-3 py-1 text-xs">
              <LinkIcon className="size-3" />
              <span className="max-w-[140px] truncate">{att.label ?? att.url}</span>
              <button
                onClick={() => setPendingAttachments((prev) => prev.filter((_, x) => x !== i))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="px-4 pb-3 pt-2 border-t border-border bg-background">
        <div className="flex items-end gap-2">
          <button
            onClick={promptLink}
            className="size-10 rounded-full bg-card ring-1 ring-border flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Прикрепить ссылку"
          >
            <Paperclip className="size-4" />
          </button>
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
            placeholder={placeholder}
            className="flex-1 bg-card border border-border rounded-3xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none max-h-32"
          />
          <button
            onClick={send}
            className="size-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0 disabled:opacity-50"
            disabled={!text.trim() && pendingAttachments.length === 0}
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
