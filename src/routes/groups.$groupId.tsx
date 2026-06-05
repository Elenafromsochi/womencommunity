import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Users, Clock, CalendarDays } from "lucide-react";
import { groups } from "../lib/mock-data";
import { useAppStore } from "../lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/groups/$groupId")({
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

  if (!group) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground">
        Группа не найдена
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="px-6 pt-2 flex items-center gap-3">
        <Link
          to="/groups"
          className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-border"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span className="font-[Lora] text-lg">Группа</span>
      </div>

      {/* Profile */}
      <div className="px-6">
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-full bg-cream flex items-center justify-center text-4xl ring-1 ring-border/50 overflow-hidden">
            {group.avatar ? (
              <img src={group.avatar} alt={group.curator} className="w-full h-full object-cover" />
            ) : (
              <span>👭</span>
            )}
          </div>
          <div>
            <h1 className="font-[Lora] text-2xl leading-tight">{group.title}</h1>
            <p className="text-sm text-accent font-medium mt-1">
              Куратор: {group.curator}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          {group.description}
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
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
            Старт: {group.startDate.split(" ").slice(0, 2).join(" ")}
          </span>
        </div>

        {isApplied ? (
          <div className="w-full py-3.5 text-center text-sm font-medium text-accent bg-accent/10 rounded-full mt-6">
            Заявка подана
          </div>
        ) : (
          <button
            onClick={() => {
              toggleGroupApplication(group.id);
              toast.success("Заявка отправлена!");
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium bg-foreground text-primary-foreground rounded-full mt-6"
          >
            Подать заявку
            <ArrowRight className="size-4" />
          </button>
        )}
      </div>

      {/* Features */}
      <div className="px-6">
        <h2 className="font-[Lora] text-xl mb-3">Что входит</h2>
        <div className="space-y-2">
          {[
            "Регулярные встречи с куратором",
            "Закрытый чат группы",
            "Практические задания",
            "Поддержка единомышленниц",
            "Доступ к материалам куратора",
          ].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3 bg-card p-4 rounded-[1.5rem] ring-1 ring-border"
            >
              <div className="size-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <div className="size-2 bg-accent rounded-full" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
