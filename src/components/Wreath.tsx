import { SPHERES, sphereById } from "../lib/methodology";
import type { SphereId } from "../lib/types";

/**
 * Венок 9 сфер (мотив лаврового венка из логотипа).
 * Сферы кольцом; опорная — раскрыта (увеличена, подсвечена, с подписью).
 * Display-only: используется в карте результата диагностики и в профиле.
 */
export function Wreath({
  supportSphere,
  selectedSpheres = [],
  supportScore,
  scores,
  onSelect,
  size = 300,
  className = "",
}: {
  supportSphere?: SphereId;
  selectedSpheres?: SphereId[];
  /** Шкала в опорной сфере 0–10 (показывается в центре). */
  supportScore?: number;
  /** Оценки по сферам 0–10 — сферы с оценкой подсвечиваются. */
  scores?: Partial<Record<SphereId, number>>;
  /** Если задан — сферы становятся кликабельными. */
  onSelect?: (id: SphereId) => void;
  size?: number;
  className?: string;
}) {
  const radius = size * 0.37; // радиус кольца
  const center = size / 2;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Венок девяти сфер жизни"
    >
      {/* Декоративное кольцо */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={1.5}
          strokeDasharray="2 7"
        />
      </svg>

      {/* Центр — опорная сфера раскрыта */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center"
        style={{ left: center, top: center, width: size * 0.42, height: size * 0.42 }}
      >
        {supportSphere ? (
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Опорная
            </span>
            <span className="text-3xl mt-1 leading-none">
              {sphereById(supportSphere).emoji}
            </span>
            <span className="font-[Lora] text-sm leading-tight mt-1 max-w-[90px]">
              {sphereById(supportSphere).name}
            </span>
            {supportScore != null && (
              <span className="text-[11px] text-accent font-medium mt-0.5">
                {supportScore}/10
              </span>
            )}
          </div>
        ) : (
          <span className="text-4xl opacity-60">🌿</span>
        )}
      </div>

      {/* Кольцо сфер */}
      {SPHERES.map((sphere, i) => {
        const angle = (-90 + i * (360 / SPHERES.length)) * (Math.PI / 180);
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const isSupport = sphere.id === supportSphere;
        const isSelected = selectedSpheres.includes(sphere.id);
        const hasScore = scores?.[sphere.id] != null;
        const active = isSupport || isSelected || hasScore;
        const node = size * (isSupport ? 0.17 : 0.13);

        return (
          <button
            key={sphere.id}
            type="button"
            disabled={!onSelect}
            onClick={() => onSelect?.(sphere.id)}
            aria-label={sphere.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center disabled:cursor-default"
            style={{ left: x, top: y }}
          >
            <div
              className="rounded-full flex items-center justify-center transition-all"
              style={{
                width: node,
                height: node,
                background: active ? sphere.color : "var(--color-card)",
                boxShadow: isSupport
                  ? `0 0 0 3px var(--color-background), 0 0 0 5px ${sphere.color}, 0 8px 20px -6px ${sphere.color}`
                  : "0 1px 4px rgba(0,0,0,0.06)",
                opacity: active ? 1 : 0.45,
                border: "1px solid var(--color-border)",
              }}
            >
              <span style={{ fontSize: node * 0.5 }}>{sphere.emoji}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
