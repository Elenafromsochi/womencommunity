import type { ContentType } from "../lib/types";

// Красивая обложка «в едином стиле», когда своей картинки нет.
// Детерминированный градиент по теме + эмодзи по типу + название.

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const EMOJI: Record<ContentType, string> = {
  article: "📖",
  audio: "🎧",
  video: "🎬",
  practice: "🧘‍♀️",
  collection: "🌿",
};

export function CoverPlaceholder({
  title,
  topic,
  type,
  className = "",
}: {
  title: string;
  topic: string;
  type: ContentType;
  className?: string;
}) {
  const hue = hash(topic || title) % 360;
  const bg = `linear-gradient(135deg, hsl(${hue} 42% 88%), hsl(${(hue + 45) % 360} 48% 78%))`;
  return (
    <div
      className={`flex items-center justify-center text-center p-6 ${className}`}
      style={{ background: bg }}
    >
      <div>
        <div className="text-4xl mb-2">{EMOJI[type]}</div>
        <p className="font-[Lora] text-lg leading-tight text-foreground/80 line-clamp-3">
          {title}
        </p>
      </div>
    </div>
  );
}
