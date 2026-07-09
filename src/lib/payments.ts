import { supabase } from "./supabase";
import { useAppStore } from "./store";
import type { Event } from "./types";

// Оплаты (заглушки). Две точки: подписка на клуб (100% платформе) и мастермайнд
// эксперта (сплит 50/50). Сами платежи имитируются серверными функциями
// pay_subscription / pay_mastermind, которые считают сплит на сервере.

export const SUB_PRICES = { monthly: 490, yearly: 3900 };
export const PLATFORM_FEE_RATE = 0.5; // 50% платформе

export interface Mastermind {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  type: "online" | "offline";
  location?: string;
  price: number;
  spots?: number;
}

export interface PaymentRow {
  id: string;
  kind: "subscription" | "mastermind";
  plan?: string;
  itemTitle: string;
  amount: number;
  platformFee: number;
  expertAmount: number;
  expiresAt?: string;
  createdAt: string;
  mastermindId?: string;
  payerName?: string;
}

export interface SubscriptionStatus {
  plan: string;
  expiresAt: string;
  active: boolean;
}

interface MastermindRow {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  description: string;
  date: string | null;
  time: string | null;
  type: string;
  location: string | null;
  price: number | string;
  spots: number | null;
}

interface PaymentDbRow {
  id: string;
  kind: string;
  plan: string | null;
  item_title: string;
  amount: number | string;
  platform_fee: number | string;
  expert_amount: number | string;
  expires_at: string | null;
  created_at: string;
  mastermind_id: string | null;
  payer_name: string | null;
}

const num = (v: number | string | null | undefined) => Number(v ?? 0);

function toMastermind(r: MastermindRow): Mastermind {
  return {
    id: r.id,
    authorId: r.author_id,
    authorName: r.author_name,
    title: r.title,
    description: r.description,
    date: r.date ?? undefined,
    time: r.time ?? undefined,
    type: r.type === "offline" ? "offline" : "online",
    location: r.location ?? undefined,
    price: num(r.price),
    spots: r.spots ?? undefined,
  };
}

function toPayment(r: PaymentDbRow): PaymentRow {
  return {
    id: r.id,
    kind: r.kind === "subscription" ? "subscription" : "mastermind",
    plan: r.plan ?? undefined,
    itemTitle: r.item_title,
    amount: num(r.amount),
    platformFee: num(r.platform_fee),
    expertAmount: num(r.expert_amount),
    expiresAt: r.expires_at ?? undefined,
    createdAt: r.created_at,
    mastermindId: r.mastermind_id ?? undefined,
    payerName: r.payer_name ?? undefined,
  };
}

/** Мастермайнд как «мероприятие» для общей ленты событий. */
export function mastermindToEvent(m: Mastermind): Event {
  return {
    id: m.id,
    title: m.title,
    mentor: m.authorName,
    date: m.date ?? "",
    time: m.time ?? "",
    description: m.description,
    spots: m.spots ?? 0,
    spotsTotal: m.spots ?? 0,
    type: m.type,
    price: m.price,
    location: m.location,
    mastermindId: m.id,
  };
}

// ===== Мастермайнды =====

export async function fetchMasterminds(): Promise<Mastermind[]> {
  const { data, error } = await supabase
    .from("masterminds")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchMasterminds:", error.message);
    return [];
  }
  return (data as MastermindRow[]).map(toMastermind);
}

export async function createMastermind(input: {
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  type: "online" | "offline";
  location?: string;
  price: number;
  spots?: number;
}): Promise<{ error?: string }> {
  const { error } = await supabase.from("masterminds").insert({
    author_id: input.authorId,
    author_name: input.authorName,
    title: input.title,
    description: input.description,
    date: input.date ?? null,
    time: input.time ?? null,
    type: input.type,
    location: input.location ?? null,
    price: input.price,
    spots: input.spots ?? null,
  });
  return error ? { error: error.message } : {};
}

export async function deleteMastermind(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("masterminds").delete().eq("id", id);
  return error ? { error: error.message } : {};
}

// ===== Оплаты =====

export async function paySubscription(
  plan: "monthly" | "yearly",
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("pay_subscription", { p_plan: plan });
  return error ? { error: error.message } : {};
}

export async function payMastermind(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc("pay_mastermind", { p_mastermind_id: id });
  return error ? { error: error.message } : {};
}

/** Мои платежи (история) — плательщик. */
export async function fetchMyPayments(userId: string): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("payer_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchMyPayments:", error.message);
    return [];
  }
  return (data as PaymentDbRow[]).map(toPayment);
}

/** Продажи мастермайндов эксперта — для баланса. */
export async function fetchExpertSales(userId: string): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("expert_id", userId)
    .eq("kind", "mastermind")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchExpertSales:", error.message);
    return [];
  }
  return (data as PaymentDbRow[]).map(toPayment);
}

/**
 * Загрузить платёжные данные в стор при входе: мастермайнды (для ленты),
 * статус подписки и список оплаченных мастермайндов.
 */
export async function loadPayments(userId: string): Promise<void> {
  const [masterminds, payments] = await Promise.all([
    fetchMasterminds(),
    fetchMyPayments(userId),
  ]);
  const subs = payments
    .filter((p) => p.kind === "subscription" && p.expiresAt)
    .sort((a, b) => (a.expiresAt! < b.expiresAt! ? 1 : -1));
  const latest = subs[0];
  const subscription: SubscriptionStatus | null = latest
    ? {
        plan: latest.plan ?? "monthly",
        expiresAt: latest.expiresAt!,
        active: new Date(latest.expiresAt!).getTime() > Date.now(),
      }
    : null;
  const paidMastermindIds = payments
    .filter((p) => p.kind === "mastermind" && p.mastermindId)
    .map((p) => p.mastermindId!);

  const st = useAppStore.getState();
  st.setMasterminds(masterminds);
  st.setSubscription(subscription);
  st.setPaidMastermindIds(paidMastermindIds);
}
