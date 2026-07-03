import { SPHERES, STATE_SPHERE } from "../lib/methodology";
import type { SphereId } from "../lib/types";

/**
 * Колесо баланса: 6 сфер-лепестков вокруг центра «Состояние».
 * Каждый сектор заполнен по оценке сферы (0–10); центр — общий пульс.
 * Клик по сектору открывает сферу, клик по центру — «Состояние».
 */
export function WheelOfBalance({
  scores,
  focus = [],
  stateScore,
  onSelect,
  onSelectState,
  size = 320,
  className = "",
}: {
  scores: Partial<Record<SphereId, number>>;
  focus?: SphereId[];
  /** Пульс «Состояния» 0–10 (центр). */
  stateScore?: number;
  onSelect?: (id: SphereId) => void;
  onSelectState?: () => void;
  size?: number;
  className?: string;
}) {
  const c = size / 2;
  const R = size * 0.31;
  const labelR = size * 0.41;
  const rc = size * 0.15; // радиус центра «Состояние»
  const n = SPHERES.length;
  const step = 360 / n;

  const pt = (deg: number, r: number): [number, number] => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };
  const wedge = (d0: number, d1: number, r: number) => {
    const [x0, y0] = pt(d0, r);
    const [x1, y1] = pt(d1, r);
    return `M ${c} ${c} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`;
  };
  const arc = (d0: number, d1: number, r: number) => {
    const [x0, y0] = pt(d0, r);
    const [x1, y1] = pt(d1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };

  const stateFill =
    stateScore != null ? 0.2 + (stateScore / 10) * 0.55 : 0.12;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Колесо баланса">
        {[2, 4, 6, 8, 10].map((k) => (
          <circle key={k} cx={c} cy={c} r={(R * k) / 10} fill="none" stroke="var(--color-border)" strokeWidth={1} />
        ))}

        {SPHERES.map((sphere, i) => {
          const d0 = i * step;
          const d1 = d0 + step;
          const mid = d0 + step / 2;
          const score = scores[sphere.id];
          const filledR = score != null ? (R * score) / 10 : 0;
          const isFocus = focus.includes(sphere.id);
          const [ex, ey] = pt(mid, R * 0.72);
          const [lx, ly] = pt(mid, labelR);

          return (
            <g key={sphere.id} onClick={() => onSelect?.(sphere.id)} style={{ cursor: onSelect ? "pointer" : "default" }}>
              {filledR > 0 && <path d={wedge(d0, d1, filledR)} fill={sphere.color} fillOpacity={0.85} />}
              <path d={wedge(d0, d1, R)} fill="transparent" />
              <line x1={c} y1={c} x2={pt(d0, R)[0]} y2={pt(d0, R)[1]} stroke="var(--color-border)" strokeWidth={1} />
              {isFocus && <path d={arc(d0 + 1, d1 - 1, R)} fill="none" stroke={sphere.color} strokeWidth={4} strokeLinecap="round" />}
              <text x={ex} y={ey} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.05}>
                {sphere.emoji}
              </text>
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.032}
                fill={isFocus ? "var(--color-foreground)" : "var(--color-muted-foreground)"}
                style={{ fontWeight: isFocus ? 700 : 500 }}
              >
                {isFocus ? "★ " : ""}
                {sphere.short}
              </text>
            </g>
          );
        })}

        <circle cx={c} cy={c} r={R} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />

        {/* Центр — «Состояние» */}
        <g onClick={() => onSelectState?.()} style={{ cursor: onSelectState ? "pointer" : "default" }}>
          <circle cx={c} cy={c} r={rc} fill={STATE_SPHERE.color} fillOpacity={stateFill} stroke="var(--color-background)" strokeWidth={3} />
          <circle cx={c} cy={c} r={rc} fill="none" stroke={STATE_SPHERE.color} strokeWidth={1.5} />
          <text x={c} y={c - rc * 0.32} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.05}>
            {STATE_SPHERE.emoji}
          </text>
          <text x={c} y={c + rc * 0.12} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.07} fontWeight={700} fill="var(--color-foreground)">
            {stateScore != null ? stateScore : "—"}
          </text>
          <text x={c} y={c + rc * 0.6} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.03} fill="var(--color-muted-foreground)">
            Состояние
          </text>
        </g>
      </svg>
    </div>
  );
}
