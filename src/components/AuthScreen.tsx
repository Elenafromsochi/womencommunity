import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../lib/auth";

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError("Введите email и пароль (минимум 6 символов).");
      return;
    }
    setBusy(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) setError(translateError(error));
  };

  return (
    <div className="min-h-[100dvh] px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-[360px] flex flex-col items-center text-center">
        <div className="size-20 rounded-full bg-cream flex items-center justify-center ring-1 ring-border">
          <span className="text-4xl">🌸</span>
        </div>
        <h1 className="font-[Lora] text-3xl leading-tight mt-6">
          <span className="italic">Женское общество</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === "signin"
            ? "Рады видеть вас снова"
            : "Создайте аккаунт, чтобы начать"}
        </p>

        <div className="w-full space-y-3 mt-8 text-left">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Пароль
            </label>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Минимум 6 символов"
              className="mt-1.5 w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {error && <p className="text-xs text-destructive mt-3 w-full text-left">{error}</p>}

        <button
          onClick={submit}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-primary-foreground text-sm font-medium py-3.5 rounded-full mt-6 transition-opacity disabled:opacity-50"
        >
          {busy ? "Минуту…" : mode === "signin" ? "Войти" : "Создать аккаунт"}
          {!busy && <ArrowRight className="size-4" />}
        </button>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          className="text-xs text-muted-foreground hover:text-foreground mt-5"
        >
          {mode === "signin"
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}

function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Неверный email или пароль.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Такой email уже зарегистрирован. Войдите.";
  if (m.includes("email not confirmed"))
    return "Email не подтверждён. Проверьте почту или отключите подтверждение в настройках.";
  if (m.includes("password")) return "Пароль слишком короткий (минимум 6 символов).";
  return message;
}
