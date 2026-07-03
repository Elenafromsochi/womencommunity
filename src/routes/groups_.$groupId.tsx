import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Users, Clock, CalendarDays } from "lucide-react";
import { groups, groupChats } from "../lib/mock-data";
import { useAppStore } from "../lib/store";
import { toast } from "sonner";
import { ChatView } from "../components/ChatView";

export const Route = createFileRoute("/groups_/$groupId")({
  head: () => ({
    meta: [
      { title: "Женское общество — Группа" },
      { name: "description", content: "Страница группы сопровождения" },
    ],
  }),
  component: GroupDetailPage,
});

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const group = groups.find((g) => g.id === groupId);
  const appliedGroupIds = useAppStore((s) => s.appliedGroupIds);
  const toggleGroupApplication = useAppStore((s) => s.toggleGroupApplication);
  const isApplied = group ? appliedGroupIds.includes(group.id) : false;
  const [tab, setTab] = useState<"about" | "chat">("about");

  if (!group) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground">
        Группа не найдена
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)]">
      <div className="px-6 pt-2 flex items-center gap-3">
        <Link
          to="/groups"
          className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-border"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Группа</p>
          <h1 className="font-[Lora] text-lg leading-tight truncate">{group.title}</h1>
        </div>
      </div>

      <div className="px-6 pt-3 pb-3 flex gap-4 border-b border-border">
        {[
          { key: "about" as const, label: "О группе" },
          { key: "chat" as const, label: "Чат группы" },
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

      {tab === "about" ? (
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-full bg-cream flex items-center justify-center text-4xl ring-1 ring-border/50 overflow-hidden">
              {group.avatar ? (
                <img src={group.avatar} alt={group.curator} className="w-full h-full object-cover" />
              ) : (
                <span>👭</span>
              )}
            </div>
            <div>
              <p className="text-sm text-accent font-medium">Куратор: {group.curator}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{group.duration} • старт {group.startDate}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>

          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full ring-1 ring-border">
              <Users className="size-3.5" />
              {group.spotsTotal - group.spots}/{group.spotsTotal} участниц
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full ring-1 ring-border">
              <Clock className="size-3.5" />
              {group.duration}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full ring-1 ring-border">
              <CalendarDays className="size-3.5" />
              {group.startDate.split(" ").slice(0, 2).join(" ")}
            </span>
          </div>

          {isApplied ? (
            <button
              onClick={() => setTab("chat")}
              className="w-full py-3.5 text-sm font-medium text-accent-foreground bg-accent rounded-full"
            >
              Открыть чат группы
            </button>
          ) : (
            <button
              onClick={() => {
                toggleGroupApplication(group.id);
                toast.success("Заявка отправлена!");
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium bg-foreground text-primary-foreground rounded-full"
            >
              Подать заявку
              <ArrowRight className="size-4" />
            </button>
          )}

          <div>
            <h2 className="font-[Lora] text-xl mb-3">Что входит</h2>
            <div className="space-y-2">
              {[
                "Регулярные встречи с куратором",
                "Закрытый чат группы с поддержкой 24/7",
                "Практические задания и материалы",
                "Поддержка единомышленниц",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 bg-card p-4 rounded-[1.5rem] ring-1 ring-border">
                  <div className="size-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <div className="size-2 bg-accent rounded-full" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ChatView
          initialMessages={groupChats[group.id] ?? []}
          storageKey={`group-chat-${group.id}`}
          participants={[group.curator, "Алина", "Мария"]}
          placeholder={`Сообщение в «${group.title}»…`}
        />
      )}
    </div>
  );
}
