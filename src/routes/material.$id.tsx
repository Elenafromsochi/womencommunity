import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Play, Headphones, FileText, Sparkles } from "lucide-react";
import { useAppStore } from "../lib/store";
import { useAllContent } from "../lib/content";
import { MediaEmbed } from "../components/MediaEmbed";
import { parseMedia } from "../lib/embed";
import type { ContentType } from "../lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/material/$id")({
  head: () => ({ meta: [{ title: "Женское общество — Материал" }] }),
  component: MaterialPage,
});

const typeLabel: Record<ContentType, string> = {
  article: "Статья",
  audio: "Аудио",
  video: "Видео",
  practice: "Практика",
  collection: "Подборка",
};

function TypeIcon({ type }: { type: ContentType }) {
  const cls = "size-4";
  if (type === "audio") return <Headphones className={cls} />;
  if (type === "video") return <Play className={cls} />;
  if (type === "collection") return <Sparkles className={cls} />;
  return <FileText className={cls} />;
}

function MaterialPage() {
  const { id } = Route.useParams();
  const item = useAllContent().find((c) => c.id === id);
  const savedContentIds = useAppStore((s) => s.savedContentIds);
  const toggleSavedContent = useAppStore((s) => s.toggleSavedContent);

  if (!item) {
    return (
      <div className="px-6 py-10 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Материал не найден.</p>
        <Link to="/topics" className="text-sm text-accent">
          Ко всем темам
        </Link>
      </div>
    );
  }

  const saved = savedContentIds.includes(item.id);
  const media = parseMedia(item.mediaUrl);

  return (
    <div className="px-6 space-y-6 pb-8">
      <Link
        to="/topics"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Темы
      </Link>

      {/* Медиа: встроенный плеер по ссылке, иначе обложка */}
      {media && media.kind !== "link" ? (
        <MediaEmbed url={item.mediaUrl} />
      ) : (
        <div className="rounded-[2rem] overflow-hidden bg-cream ring-1 ring-border aspect-video flex items-center justify-center">
          {item.cover ? (
            <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl opacity-70">
              {item.type === "audio" ? "🎧" : item.type === "video" ? "🎬" : "🌿"}
            </span>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 text-accent">
          <TypeIcon type={item.type} />
          <span className="text-[11px] uppercase tracking-wider font-medium">
            {typeLabel[item.type]}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {item.topic}
            {item.duration ? ` · ${item.duration}` : ""}
          </span>
        </div>
        <h1 className="font-[Lora] text-2xl leading-tight mt-2">{item.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {item.author} · {item.date}
        </p>
      </div>

      {/* Внешняя ссылка (сервис без встраивания) — кнопка «Открыть» */}
      {media?.kind === "link" && <MediaEmbed url={item.mediaUrl} />}

      {/* Текст */}
      <div className="space-y-4">
        {(item.body ?? [item.description]).map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
            {p}
          </p>
        ))}
      </div>

      {/* Нравится = добавить в «Сохранённое» */}
      <button
        onClick={() => {
          toggleSavedContent(item.id);
          toast.success(saved ? "Убрали из сохранённого" : "Добавили в сохранённое");
        }}
        className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-medium border transition-all ${
          saved
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-foreground border-border"
        }`}
      >
        <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
        {saved ? "В сохранённом" : "Нравится · сохранить"}
      </button>
    </div>
  );
}
