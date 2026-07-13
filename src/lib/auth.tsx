import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useAppStore, selectCloudState } from "./store";
import { loadCloudState, saveCloudState } from "./sync";
import { loadSharedMaterials } from "./materials-db";
import { loadPayments } from "./payments";
import { loadNotifications } from "./notifications-db";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Начальная сессия + подписка на изменения аутентификации.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  // При входе — загрузить данные из облака; при выходе — сбросить.
  useEffect(() => {
    let cancelled = false;
    if (userId) {
      useAppStore.getState().setUserId(userId);
      loadCloudState(userId).then((state) => {
        if (!cancelled) useAppStore.getState().hydrate(state);
      });
      // Общая база материалов клуба (одобренные для ленты + свои для кабинета).
      void loadSharedMaterials(userId);
      // Оплаты: мастермайнды, статус подписки, оплаченные мастермайнды.
      void loadPayments(userId);
      // Уведомления (модерация и т.д.).
      void loadNotifications(userId);
    } else {
      useAppStore.getState().resetToDefaults();
      useAppStore.getState().clearSharedMaterials();
    }
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Автосохранение изменений состояния в облако (с задержкой).
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = useAppStore.subscribe((state) => {
      if (!state.hydrated || !state.userId) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void saveCloudState(state.userId!, selectCloudState(state));
      }, 700);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [userId]);

  const signUp: AuthContextValue["signUp"] = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? { error: error.message } : {};
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
