import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Users, Clock, CalendarDays } from "lucide-react";
import { groups } from "../lib/mock-data";
import { useAppStore } from "../lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Женское общество — Группы" },
      { name: "description", content: "Группы сопровождения" },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const appliedGroupIds = useAppStore((s) => s.appliedGroupIds);
  const toggleGroupApplication = useAppStore((s) => s.toggleGroupApplication);

  return (
    <div className="px-6 space-y-6 pb-4">
      <div>
        <h1 className="font-[Lora] text-3xl leading-tight">
          Группы сопровождения
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Камерные группы до 6 участниц с куратором на 2-3 месяца
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-card p-5 rounded-[2.5rem] ring-1 ring-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="size-14 rounded-full bg-cream flex items-center justify-center text-2xl ring-1 ring-border/50 overflow-hidden">
                {group.avatar ? (
                  <img src={group.avatar} alt={group.curator} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span>👭</span>
                )}
              </div>
              <div>
                <h3 className="font-[Lora] text-xl leading-tight">
                  {group.title}
                </h3>
                <p className="text-xs text-accent font-medium mt-1">
                  Куратор: {group.curator}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {group.description}
            </p>
            <div className="flex items-center gap-4 mb-5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {group.spotsTotal - group.spots}/{group.spotsTotal} участниц
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {group.duration}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Старт: {group.startDate.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
            {appliedGroupIds.includes(group.id) ? (
              <div className="w-full py-3 text-center text-sm font-medium text-accent bg-accent/10 rounded-full">
                Заявка подана
              </div>
            ) : (
              <button
                onClick={() => {
                  toggleGroupApplication(group.id);
                  toast.success("Заявка отправлена!");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium bg-foreground text-primary-foreground rounded-full"
              >
                Подать заявку
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
