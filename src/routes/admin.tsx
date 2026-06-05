import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Users, FileText, Calendar, Shield, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Женское общество — Администратор" },
      { name: "description", content: "Панель администратора" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="px-6 space-y-6 pb-4 min-h-[100dvh]">
      <div className="pt-2 flex items-center gap-3">
        <Link
          to="/"
          className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-border"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span className="font-[Lora] text-lg">Администратор</span>
      </div>

      <div className="bg-cream p-6 rounded-[2.5rem] ring-1 ring-border text-center">
        <div className="size-16 rounded-full bg-card flex items-center justify-center text-3xl mx-auto mb-4 ring-1 ring-border/50">
          ⚙️
        </div>
        <h2 className="font-[Lora] text-xl">Панель администратора</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Этот раздел в разработке. В полной версии здесь будет:
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PlaceholderCard icon={<Users className="size-5" />} label="Пользователи" desc="Управление ролями" />
        <PlaceholderCard icon={<FileText className="size-5" />} label="Модерация" desc="Контент и жалобы" />
        <PlaceholderCard icon={<Calendar className="size-5" />} label="Мероприятия" desc="Все события" />
        <PlaceholderCard icon={<Shield className="size-5" />} label="Роли" desc="Назначение ролей" />
        <PlaceholderCard icon={<BarChart3 className="size-5" />} label="Аналитика" desc="Статистика сообщества" />
      </div>

      <div className="text-center py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-primary font-medium"
        >
          Вернуться к интерфейсу участницы
        </Link>
      </div>
    </div>
  );
}

function PlaceholderCard({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="bg-card p-5 rounded-[2rem] ring-1 ring-border flex flex-col items-center text-center gap-2 opacity-60">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground">{desc}</span>
    </div>
  );
}
