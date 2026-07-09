import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Crown } from "lucide-react";
import { useAppStore } from "../lib/store";
import {
  SUB_PRICES,
  paySubscription,
  fetchMyPayments,
  loadPayments,
  type PaymentRow,
} from "../lib/payments";
import { toast } from "sonner";

export const Route = createFileRoute("/subscription")({
  head: () => ({ meta: [{ title: "Женское общество — Подписка" }] }),
  component: SubscriptionPage,
});

const fmt = (n: number) => n.toLocaleString("ru-RU");
const ruDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

function SubscriptionPage() {
  const userId = useAppStore((s) => s.userId);
  const subscription = useAppStore((s) => s.subscription);
  const [busy, setBusy] = useState<"monthly" | "yearly" | null>(null);
  const [history, setHistory] = useState<PaymentRow[]>([]);

  const loadHistory = async () => {
    if (!userId) return;
    const all = await fetchMyPayments(userId);
    setHistory(all.filter((p) => p.kind === "subscription"));
  };

  useEffect(() => {
    void loadHistory();
  }, [userId]);

  const pay = async (plan: "monthly" | "yearly") => {
    if (!userId || busy) return;
    setBusy(plan);
    const { error } = await paySubscription(plan);
    if (!error) {
      await loadPayments(userId);
      await loadHistory();
    }
    setBusy(null);
    if (error) toast.error("Оплата не прошла. Попробуйте ещё раз.");
    else toast.success("Подписка оформлена 🌸");
  };

  const yearlyMonthly = Math.round(SUB_PRICES.yearly / 12);
  const savePercent = Math.round((1 - SUB_PRICES.yearly / (SUB_PRICES.monthly * 12)) * 100);

  return (
    <div className="px-6 space-y-6 pb-8">
      <div className="pt-2 flex items-center gap-3">
        <Link to="/profile" className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-border">
          <ArrowLeft className="size-5" />
        </Link>
        <span className="font-[Lora] text-lg">Подписка на клуб</span>
      </div>

      {subscription?.active ? (
        <div className="bg-primary text-primary-foreground rounded-[2rem] p-6">
          <div className="flex items-center gap-2">
            <Crown className="size-5" />
            <span className="font-[Lora] text-xl">Подписка активна</span>
          </div>
          <p className="text-sm text-primary-foreground/85 mt-2">
            {subscription.plan === "yearly" ? "Годовая" : "Месячная"} · действует до{" "}
            {ruDate(subscription.expiresAt)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Доступ ко всем материалам, событиям и поддержке клуба. Можно продлевать
          помесячно или оформить год выгоднее.
        </p>
      )}

      <div className="space-y-3">
        <PlanCard
          title="Месяц"
          price={`${fmt(SUB_PRICES.monthly)} ₽`}
          sub="в месяц, продлевается ежемесячно"
          busy={busy === "monthly"}
          onPay={() => pay("monthly")}
          cta={subscription?.active ? "Продлить на месяц" : "Оформить на месяц"}
        />
        <PlanCard
          title="Год"
          price={`${fmt(SUB_PRICES.yearly)} ₽`}
          sub={`≈ ${fmt(yearlyMonthly)} ₽ в месяц · выгода ${savePercent}%`}
          highlight
          badge={`−${savePercent}%`}
          busy={busy === "yearly"}
          onPay={() => pay("yearly")}
          cta={subscription?.active ? "Продлить на год" : "Оформить на год"}
        />
      </div>

      <p className="text-[11px] text-muted-foreground/70 px-1">
        Пока оплата тестовая (заглушка) — деньги не списываются. Когда подключим
        платёжный сервис, кнопки будут работать по-настоящему.
      </p>

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-[Lora] text-lg">История оплат</h2>
          {history.map((p) => (
            <div key={p.id} className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{p.itemTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {ruDate(p.createdAt)}
                  {p.expiresAt ? ` · до ${ruDate(p.expiresAt)}` : ""}
                </p>
              </div>
              <span className="text-sm font-medium">{fmt(p.amount)} ₽</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function PlanCard({
  title,
  price,
  sub,
  cta,
  busy,
  onPay,
  highlight,
  badge,
}: {
  title: string;
  price: string;
  sub: string;
  cta: string;
  busy: boolean;
  onPay: () => void;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] p-5 ring-1 ${
        highlight ? "bg-cream ring-primary/30" : "bg-card ring-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-[Lora] text-xl">{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="font-[Lora] text-2xl mt-1">{price}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      <button
        onClick={onPay}
        disabled={busy}
        className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50"
      >
        <Check className="size-4" />
        {busy ? "Оформляем…" : cta}
      </button>
    </div>
  );
}
