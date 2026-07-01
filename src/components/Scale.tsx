/**
 * Мягкая шкала 0–10. Используется в диагностике, дневном цикле, ретестах.
 * value === null — ещё ничего не выбрано.
 */
export function Scale({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-11 gap-1.5">
        {Array.from({ length: 11 }, (_, n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:ring-primary/40"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}
