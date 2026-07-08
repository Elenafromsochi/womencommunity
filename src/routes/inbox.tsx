import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  fetchConversations,
  currentUserId,
  type Conversation,
} from "../lib/chat";

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [{ title: "Женское общество — Сообщения" }] }),
  component: Inbox,
});

function Inbox() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    currentUserId().then(async (id) => {
      if (id) setItems(await fetchConversations(id));
      setLoading(false);
    });
  }, []);

  return (
    <div className="px-6 space-y-5 pb-4">
      <h1 className="font-[Lora] text-3xl leading-tight">Сообщения</h1>

      {!loading && items.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <MessageCircle className="size-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">
            Пока нет сообщений. Здесь появится переписка с участницами.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((c) => (
          <Link
            key={c.peerId}
            to="/chat/$peerId"
            params={{ peerId: c.peerId }}
            search={{ name: c.peerName }}
            className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="size-11 rounded-full bg-cream flex items-center justify-center text-lg shrink-0">
              💬
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{c.peerName}</p>
              <p className="text-xs text-muted-foreground truncate">{c.lastText}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
