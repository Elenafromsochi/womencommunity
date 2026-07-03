import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, X, UserPlus, Check } from "lucide-react";
import { useAppStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { SPHERES, sphereById } from "../lib/methodology";
import type { SphereId } from "../lib/types";
import {
  upsertBuddyRequest,
  removeBuddyRequest,
  fetchMyRequests,
  fetchMatches,
  sendInvite,
  fetchIncomingInvites,
  respondInvite,
  fetchMyBuddies,
  type BuddyRequest,
  type BuddyInvite,
} from "../lib/buddy";
import { toast } from "sonner";

export const Route = createFileRoute("/buddy")({
  head: () => ({ meta: [{ title: "Женское общество — Поиск бадди" }] }),
  component: BuddyPage,
});

function BuddyPage() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? "";
  const profile = useAppStore((s) => s.profile);
  const focusSpheres = useAppStore((s) => s.focusSpheres);

  const focusList = SPHERES.filter((s) => focusSpheres.includes(s.id));

  const [selected, setSelected] = useState<SphereId | null>(null);
  const [note, setNote] = useState("");
  const [myRequests, setMyRequests] = useState<BuddyRequest[]>([]);
  const [matches, setMatches] = useState<BuddyRequest[]>([]);
  const [invites, setInvites] = useState<BuddyInvite[]>([]);
  const [buddies, setBuddies] = useState<BuddyInvite[]>([]);
  const [invited, setInvited] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    if (!userId) return;
    const [mine, inv, buds] = await Promise.all([
      fetchMyRequests(userId),
      fetchIncomingInvites(userId),
      fetchMyBuddies(userId),
    ]);
    setMyRequests(mine);
    setInvites(inv);
    setBuddies(buds);
    const spheres = mine.map((r) => r.sphere);
    setMatches(await fetchMatches(spheres, userId));
  }, [userId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Гейт: нужна хотя бы одна фокус-сфера.
  if (focusList.length === 0) {
    return (
      <div className="px-6 py-10 text-center space-y-5">
        <span className="text-4xl">🤝</span>
        <div>
          <h1 className="font-[Lora] text-2xl">Сначала — фокус</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-[300px] mx-auto leading-relaxed">
            Бадди ищем по фокус-сферам. Откройте колесо баланса, оцените сферу и
            отметьте её как фокус (★) — до трёх. Из них и будем искать поддержку.
          </p>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-6 py-3 rounded-full"
        >
          Открыть колесо баланса
        </Link>
      </div>
    );
  }

  const publish = async () => {
    if (!selected) {
      toast.info("Выберите сферу");
      return;
    }
    await upsertBuddyRequest({
      userId,
      name: profile.name,
      city: profile.city || null,
      sphere: selected,
      note: note.trim() || null,
    });
    setNote("");
    setSelected(null);
    toast.success("Запрос опубликован");
    await loadAll();
  };

  const invite = async (m: BuddyRequest) => {
    const { error } = await sendInvite({
      fromUser: userId,
      toUser: m.user_id,
      sphere: m.sphere,
      fromName: profile.name,
      fromCity: profile.city || null,
      fromNote: myRequests.find((r) => r.sphere === m.sphere)?.note ?? null,
    });
    if (error) toast.error("Не получилось позвать");
    else {
      setInvited((p) => [...p, m.id]);
      toast.success("Вы позвали в бадди 💌");
    }
  };

  return (
    <div className="px-6 space-y-8 pb-6">
      <Link
        to="/community"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Общение
      </Link>

      <section>
        <h1 className="font-[Lora] text-3xl leading-tight">Поиск бадди</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Подруга по пути в конкретной сфере — вместе двигаться легче.
        </p>
      </section>

      {/* Кого ищу */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Кого ищу</h2>
        <p className="text-xs text-muted-foreground">
          Выберите одну из своих фокус-сфер (★ в колесе баланса).
        </p>
        <div className="flex flex-wrap gap-2">
          {focusList.map((s) => {
            const active = selected === s.id;
            const already = myRequests.some((r) => r.sphere === s.id);
            return (
              <button
                key={s.id}
                onClick={() => setSelected(active ? null : s.id)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                } ${already ? "opacity-60" : ""}`}
              >
                <span className="mr-1">{s.emoji}</span>
                {s.name}
              </button>
            );
          })}
        </div>
        {selected && (
          <div className="space-y-2 pt-1">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoCapitalize="none"
              autoCorrect="on"
              spellCheck
              inputMode="text"
              placeholder="Для чего ищу? Напр. утренние зарядки, контроль привычек…"
              style={{ textTransform: "none" }}
              className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={publish}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-full"
            >
              Опубликовать запрос
            </button>
          </div>
        )}

        {myRequests.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {myRequests.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full"
              >
                Ищу: {sphereById(r.sphere).name}
                <button
                  onClick={async () => {
                    await removeBuddyRequest(userId, r.sphere);
                    await loadAll();
                  }}
                  aria-label="Убрать запрос"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Приглашения */}
      {invites.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-[Lora] text-xl">Вас зовут в бадди</h2>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="bg-primary/5 ring-1 ring-primary/15 rounded-2xl p-4"
              >
                <p className="text-sm font-medium">
                  {inv.from_name}
                  {inv.from_city ? `, ${inv.from_city}` : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Сфера: {sphereById(inv.sphere).name}
                  {inv.from_note ? ` · ${inv.from_note}` : ""}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={async () => {
                      await respondInvite(inv.id, "accepted");
                      toast.success("Теперь вы бадди 🤍");
                      await loadAll();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-full"
                  >
                    <Check className="size-4" /> Принять
                  </button>
                  <button
                    onClick={async () => {
                      await respondInvite(inv.id, "declined");
                      await loadAll();
                    }}
                    className="px-4 py-2.5 rounded-full text-sm ring-1 ring-border text-muted-foreground"
                  >
                    Позже
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Мои бадди */}
      {buddies.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-[Lora] text-xl">Мои бадди</h2>
          <div className="space-y-2">
            {buddies.map((b) => (
              <div
                key={b.id}
                className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {b.from_user === userId ? "Ваш бадди" : b.from_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Сфера: {sphereById(b.sphere).name}
                  </p>
                </div>
                <span className="text-lg">🤝</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Пишите друг другу в общем чате — личные чаты бадди добавим позже.
          </p>
        </section>
      )}

      {/* Кто подходит */}
      <section className="space-y-3">
        <h2 className="font-[Lora] text-xl">Кто подходит</h2>
        {myRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Опубликуйте запрос выше — и здесь появятся те, кто ищет бадди в тех же
            сферах.
          </p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока никто не совпал. Загляните позже — сообщество растёт.
          </p>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {m.name}
                    {m.city ? `, ${m.city}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {sphereById(m.sphere).name}
                    {m.note ? ` · ${m.note}` : ""}
                  </p>
                </div>
                {invited.includes(m.id) ? (
                  <span className="text-[11px] text-accent font-medium shrink-0">
                    Позвали
                  </span>
                ) : (
                  <button
                    onClick={() => invite(m)}
                    className="shrink-0 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3.5 py-2 rounded-full"
                  >
                    <UserPlus className="size-4" />
                    Позвать
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
