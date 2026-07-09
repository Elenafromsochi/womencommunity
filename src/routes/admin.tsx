import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, Calendar, Shield, BarChart3, Check, X, Clock, RefreshCw } from "lucide-react";
import { MediaEmbed } from "../components/MediaEmbed";
import { BackToMemberButton } from "../components/BackToMemberButton";
import { parseMedia } from "../lib/embed";
import { useAppStore } from "../lib/store";
import {
  fetchPendingMaterials,
  moderateMaterial,
  loadSharedMaterials,
} from "../lib/materials-db";
import { fetchPlatformStats, type PlatformStats } from "../lib/stats";
import type { MaterialRecord } from "../lib/types";
import { toast } from "sonner";

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

      <OwnerDashboard />

      <ModerationQueue />

      <div className="grid grid-cols-2 gap-3">
        <PlaceholderCard icon={<Users className="size-5" />} label="Пользователи" desc="Управление ролями" />
        <PlaceholderCard icon={<Calendar className="size-5" />} label="Мероприятия" desc="Все события" />
        <PlaceholderCard icon={<Shield className="size-5" />} label="Роли" desc="Назначение ролей" />
        <PlaceholderCard icon={<BarChart3 className="size-5" />} label="Аналитика" desc="Статистика сообщества" />
      </div>

      <div className="text-center py-6">
        <BackToMemberButton />
      </div>
    </div>
  );
}

function OwnerDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setStats(await fetchPlatformStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const val = (n?: number) => (loading ? "…" : n === undefined || n === null ? "—" : n);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-4 text-accent" />
        <h2 className="font-[Lora] text-xl">Обзор платформы</h2>
        <button
          onClick={refresh}
          aria-label="Обновить"
          className="ml-auto size-8 rounded-full bg-card ring-1 ring-border flex items-center justify-center text-muted-foreground"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Люди */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Участниц" value={val(stats?.members_total)} accent />
        <StatTile label="Экспертов" value={val(stats?.experts_total)} />
        <StatTile label="Новых за 7 дней" value={val(stats?.new_7d)} />
      </div>

      {/* Контент */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Материалов" value={val(stats?.materials_total)} />
        <StatTile label="На модерации" value={val(stats?.materials_pending)} amber />
        <StatTile label="Опубликовано" value={val(stats?.materials_approved)} />
      </div>

      {/* Активность */}
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground px-1 pt-1">Активность</p>
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Активных за 7 дней" value={val(stats?.active_7d)} />
        <StatTile label="Записей в дневник" value={val(stats?.journal_total)} />
        <StatTile label="Отмечено шагов" value={val(stats?.steps_done)} />
      </div>

      {/* Платное */}
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground px-1 pt-1">Платное</p>
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Платных мероприятий" value={val(stats?.paid_events)} />
        <StatTile label="Записей на события" value={val(stats?.registrations_total)} />
        <StatTile label="Оплат" value={loading ? "…" : "скоро"} />
      </div>

      {!loading && !stats && (
        <p className="text-[11px] text-muted-foreground/70 px-1">
          Цифры появятся после выполнения SQL с функцией platform_stats и
          добавления вашего UID в таблицу admins (см. supabase/schema.sql).
        </p>
      )}
    </section>
  );
}

function StatTile({
  label,
  value,
  accent,
  amber,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  amber?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] p-4 ring-1 ${
        accent
          ? "bg-primary text-primary-foreground ring-primary"
          : amber
            ? "bg-amber-50 ring-amber-200"
            : "bg-card ring-border"
      }`}
    >
      <p className="font-[Lora] text-2xl leading-none">{value}</p>
      <p
        className={`text-[11px] mt-1.5 leading-tight ${
          accent ? "text-primary-foreground/80" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

function ModerationQueue() {
  const userId = useAppStore((s) => s.userId);
  const [pending, setPending] = useState<MaterialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const items = await fetchPendingMaterials();
      setPending(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const decide = async (
    m: MaterialRecord,
    status: "approved" | "rejected",
    reason?: string,
  ) => {
    setBusyId(m.id);
    const { error } = await moderateMaterial(m.id, status, reason);
    setBusyId(null);
    if (error) {
      toast.error("Не удалось. Проверьте права администратора.");
      return;
    }
    // Убираем из очереди и обновляем общий список (одобренный — в ленту всем).
    setPending((prev) => prev.filter((x) => x.id !== m.id));
    if (userId) void loadSharedMaterials(userId);
    toast.success(status === "approved" ? "Опубликовано" : "Отклонено");
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-accent" />
        <h2 className="font-[Lora] text-xl">Модерация материалов</h2>
        {pending.length > 0 && (
          <span className="ml-auto text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            {pending.length} на проверке
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-2">Загружаем очередь…</p>
      ) : pending.length === 0 ? (
        <div className="bg-cream p-6 rounded-[2rem] ring-1 ring-border text-center">
          <p className="text-sm text-muted-foreground">
            Новых материалов на модерации нет.
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            Если очередь пуста, но вы ждёте материалы — проверьте, что ваш UID
            добавлен в таблицу admins (см. supabase/schema.sql).
          </p>
        </div>
      ) : (
        pending.map((m) => (
          <ModerationCard key={m.id} m={m} busy={busyId === m.id} onDecide={decide} />
        ))
      )}
    </section>
  );
}

function ModerationCard({
  m,
  busy,
  onDecide,
}: {
  m: MaterialRecord;
  busy: boolean;
  onDecide: (m: MaterialRecord, status: "approved" | "rejected", reason?: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const media = parseMedia(m.mediaUrl);

  return (
    <div className="bg-card ring-1 ring-border rounded-[2rem] p-5 space-y-3">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-accent font-medium">
          {m.topic}
          {m.duration ? ` · ${m.duration}` : ""}
        </p>
        <h3 className="font-[Lora] text-lg leading-tight mt-0.5">{m.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Автор: {m.author}</p>
      </div>

      {m.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
      )}

      {m.cover && !media && (
        <img src={m.cover} alt="" className="w-full aspect-video object-cover rounded-2xl ring-1 ring-border" />
      )}
      {media && media.kind !== "link" && <MediaEmbed url={m.mediaUrl} />}

      {m.body && m.body.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto rounded-2xl bg-background/50 p-3 ring-1 ring-border">
          {m.body.map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-foreground/80">{p}</p>
          ))}
        </div>
      )}

      <Link
        to="/material/$id"
        params={{ id: m.id }}
        className="inline-block text-xs text-primary font-medium"
      >
        Открыть карточку целиком →
      </Link>

      {rejecting ? (
        <div className="space-y-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Причина отклонения (увидит автор)"
            style={{ textTransform: "none" }}
            className="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setRejecting(false)}
              className="flex-1 py-2.5 rounded-full text-sm ring-1 ring-border text-foreground"
            >
              Отмена
            </button>
            <button
              onClick={() => onDecide(m, "rejected", reason.trim() || undefined)}
              disabled={busy}
              className="flex-1 py-2.5 rounded-full text-sm font-medium bg-rose text-white disabled:opacity-50"
            >
              Отклонить
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setRejecting(true)}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm ring-1 ring-border text-foreground disabled:opacity-50"
          >
            <X className="size-4" />
            Отклонить
          </button>
          <button
            onClick={() => onDecide(m, "approved")}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Check className="size-4" />
            Одобрить
          </button>
        </div>
      )}
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
