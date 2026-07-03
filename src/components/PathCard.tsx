import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAppStore } from "../lib/store";
import { computeNextStep } from "../lib/path";

/**
 * «Ваш путь» — одна мягкая карточка: следующий шаг из данных участницы.
 * Без стриков и бейджей; после роста — перекрёсток из трёх дверей.
 */
export function PathCard() {
  const navigate = useNavigate();
  const diagnostic = useAppStore((s) => s.diagnostic);
  const focusSpheres = useAppStore((s) => s.focusSpheres);
  const sphereScores = useAppStore((s) => s.sphereScores);
  const sphereGoals = useAppStore((s) => s.sphereGoals);
  const progress = useAppStore((s) => s.progress);

  const step = computeNextStep({
    diagnostic,
    focusSpheres,
    sphereScores,
    sphereGoals,
    progress,
  });

  const go = (to?: string, params?: Record<string, string>) => {
    if (!to) return;
    navigate({ to, params } as never);
  };

  return (
    <section className="bg-foreground text-primary-foreground rounded-[2rem] p-6 space-y-2.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
        Ваш путь
      </span>
      {step.trail && (
        <p className="text-[11px] text-primary-foreground/55">Пройдено: {step.trail}</p>
      )}
      <h3 className="font-[Lora] text-xl leading-snug">{step.title}</h3>
      <p className="text-sm text-primary-foreground/80 leading-relaxed">{step.hint}</p>

      {step.kind === "step" ? (
        <button
          onClick={() => go(step.to, step.params)}
          className="inline-flex items-center gap-2 bg-primary-foreground text-foreground text-sm font-medium px-5 py-2.5 rounded-full mt-1.5"
        >
          {step.cta}
          <ArrowRight className="size-4" />
        </button>
      ) : (
        <div className="space-y-2 pt-1.5">
          {step.doors?.map((d, i) => (
            <button
              key={i}
              onClick={() => go(d.to, d.params)}
              className="w-full text-left bg-primary-foreground/10 hover:bg-primary-foreground/15 rounded-2xl p-3.5 flex items-center justify-between gap-2 transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium">{d.title}</span>
                <span className="block text-xs text-primary-foreground/60">{d.hint}</span>
              </span>
              <ArrowRight className="size-4 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
