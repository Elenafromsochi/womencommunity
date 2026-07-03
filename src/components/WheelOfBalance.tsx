import { SPHERES } from "../lib/methodology";
import type { SphereId } from "../lib/types";

/**
 * Классическое «Колесо баланса»: круг из 9 секторов. Каждый сектор подписан и
 * заполнен от центра наружу настолько, насколько участница оценила сферу (0–10).
 * Клик по сектору открывает страницу сферы.
 */
export function WheelOfBalance({
  scores,
  focus = [],
  onSelect,
  size = 320,
  className = "",
}: {
  scores: Partial<Record<SphereId, number>>;
  /** Фокус-сферы — выделяются яркой дугой и жирной подписью. */
  focus?: SphereId[];
  onSelect?: (id: SphereId) => void;
  size?: number;
  className?: string;
}) {
  const c = size / 2;
  const R = size * 0.3; // радиус при оценке 10
  const labelR = size * 0.4; // радиус подписей (снаружи)
  const n = SPHERES.length;
  const step = 360 / n;

  // Полярные координаты: 0° — вверху, по часовой стрелке.
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

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Колесо баланса девяти сфер"
      >
        {/* Сетка: концентрические уровни 2,4,6,8,10 */}
        {[2, 4, 6, 8, 10].map((k) => (
          <circle
            key={k}
            cx={c}
            cy={c}
            r={(R * k) / 10}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        ))}

        {SPHERES.map((sphere, i) => {
          const d0 = i * step;
          const d1 = d0 + step;
          const mid = d0 + step / 2;
          const score = scores[sphere.id];
          const filledR = score != null ? (R * score) / 10 : 0;
          const isFocus = focus.includes(sphere.id);
          const [ex, ey] = pt(mid, R * 0.66);
          const [lx, ly] = pt(mid, labelR);

          return (
            <g
              key={sphere.id}
              onClick={() => onSelect?.(sphere.id)}
              style={{ cursor: onSelect ? "pointer" : "default" }}
            >
              {/* Заполнение по оценке */}
              {filledR > 0 && (
                <path d={wedge(d0, d1, filledR)} fill={sphere.color} fillOpacity={0.85} />
              )}
              {/* Прозрачная зона клика на весь сектор */}
              <path d={wedge(d0, d1, R)} fill="transparent" />
              {/* Граница сектора */}
              <line
                x1={c}
                y1={c}
                x2={pt(d0, R)[0]}
                y2={pt(d0, R)[1]}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              {/* Яркая дуга у фокус-сферы */}
              {isFocus && (
                <path
                  d={arc(d0 + 1, d1 - 1, R)}
                  fill="none"
                  stroke={sphere.color}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              )}
              {/* Эмодзи в секторе */}
              <text x={ex} y={ey} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.05}>
                {sphere.emoji}
              </text>
              {/* Подпись снаружи */}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.033}
                fill={isFocus ? "var(--color-foreground)" : "var(--color-muted-foreground)"}
                style={{ fontWeight: isFocus ? 700 : 500 }}
              >
                {isFocus ? "★ " : ""}
                {sphere.short}
              </text>
            </g>
          );
        })}

        {/* Внешняя окружность */}
        <circle cx={c} cy={c} r={R} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
        {/* Центр */}
        <circle cx={c} cy={c} r={size * 0.02} fill="var(--color-primary)" />
      </svg>
    </div>
  );
}
