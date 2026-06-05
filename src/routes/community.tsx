import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageSquare, Send } from "lucide-react";
import { communityPosts, chatMessages } from "../lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Женское общество — Сообщество" },
      { name: "description", content: "Общение в сообществе" },
    ],
  }),
  component: CommunityPage,
});

type Tab = "introductions" | "news" | "chat";

function CommunityPage() {
  const [tab, setTab] = useState<Tab>("chat");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(chatMessages);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const toggleLike = (id: string) => {
    setLikedPosts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `ch${prev.length + 1}`,
        author: "Вы",
        text: messageText,
        timestamp: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
        avatar: undefined,
      },
    ]);
    setMessageText("");
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-140px)]">
      {/* Tabs */}
      <div className="px-6 pb-3 flex gap-2 border-b border-border">
        {[
          { key: "introductions" as Tab, label: "Знакомства" },
          { key: "news" as Tab, label: "Новости" },
          { key: "chat" as Tab, label: "Общение" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              tab === t.key
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-4">
        {tab === "introductions" && (
          <>
            {communityPosts
              .filter((p) => p.type === "introduction")
              .map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liked={likedPosts.includes(post.id)}
                  onToggleLike={() => toggleLike(post.id)}
                />
              ))}
            <div className="text-center py-8 text-muted-foreground text-sm">
              Нет новых знакомств
            </div>
          </>
        )}

        {tab === "news" && (
          <>
            {communityPosts
              .filter((p) => p.type === "news")
              .map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liked={likedPosts.includes(post.id)}
                  onToggleLike={() => toggleLike(post.id)}
                />
              ))}
          </>
        )}

        {tab === "chat" && (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : ""}`}
              >
              <div className="size-8 rounded-full bg-cream flex items-center justify-center shrink-0 text-xs overflow-hidden">
                {msg.avatar ? (
                  <img src={msg.avatar} alt={msg.author} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span>👩</span>
                )}
              </div>
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-[1.5rem] text-sm leading-relaxed ${
                    msg.isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card ring-1 ring-border rounded-tl-sm"
                  }`}
                >
                  {!msg.isMe && (
                    <p className="text-[10px] text-muted-foreground mb-1">
                      {msg.author}
                    </p>
                  )}
                  {msg.text}
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.isMe
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat input */}
      {tab === "chat" && (
        <div className="px-6 pb-2 pt-2 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Написать сообщение..."
              className="flex-1 bg-card border border-border rounded-full px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              onClick={sendMessage}
              className="size-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  liked,
  onToggleLike,
}: {
  post: (typeof communityPosts)[0];
  liked: boolean;
  onToggleLike: () => void;
}) {
  return (
    <div className="bg-card p-5 rounded-[2.5rem] ring-1 ring-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-full bg-cream flex items-center justify-center text-lg overflow-hidden">
          {post.avatar ? (
            <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span>👩</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{post.author}</p>
          <p className="text-[10px] text-muted-foreground">{post.date}</p>
        </div>
      </div>
      <h4 className="font-[Lora] text-lg leading-tight mb-2">{post.title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {post.content}
      </p>
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={onToggleLike}
          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
            liked ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Heart
            className={`size-4 ${liked ? "fill-primary" : ""}`}
          />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <MessageSquare className="size-4" />
          {post.comments}
        </button>
      </div>
    </div>
  );
}
