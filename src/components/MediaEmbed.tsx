import { ExternalLink, Download } from "lucide-react";
import { parseMedia } from "../lib/embed";

/** Показывает медиа по ссылке: видео/музыку встроенным плеером, файл — аудио, иначе — кнопку «Открыть». */
export function MediaEmbed({ url }: { url?: string }) {
  const media = parseMedia(url);
  if (!media) return null;

  if (media.kind === "video") {
    return (
      <div className="rounded-[2rem] overflow-hidden ring-1 ring-border bg-black aspect-video">
        <iframe
          src={media.embedUrl}
          title="Видео"
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.kind === "music") {
    return (
      <div className="rounded-2xl overflow-hidden ring-1 ring-border bg-card">
        <iframe
          src={media.embedUrl}
          title="Аудио"
          className="w-full"
          style={{ height: media.height, border: "none" }}
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  }

  if (media.kind === "videofile") {
    return (
      <video
        controls
        preload="metadata"
        src={media.src}
        className="w-full rounded-[2rem] ring-1 ring-border bg-black aspect-video"
      >
        Ваш браузер не поддерживает видео.
      </video>
    );
  }

  if (media.kind === "audio") {
    return (
      <audio controls preload="none" src={media.src} className="w-full">
        Ваш браузер не поддерживает аудио.
      </audio>
    );
  }

  if (media.kind === "pdf") {
    return (
      <div className="space-y-2">
        <div className="rounded-[2rem] overflow-hidden ring-1 ring-border bg-card" style={{ height: 480 }}>
          <iframe src={media.src} title="PDF" className="w-full h-full" />
        </div>
        <a
          href={media.src}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="w-full inline-flex items-center justify-center gap-2 bg-card ring-1 ring-border text-foreground text-sm font-medium py-3 rounded-full"
        >
          <Download className="size-4" />
          Открыть / сохранить PDF
        </a>
      </div>
    );
  }

  // link
  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-full"
    >
      <ExternalLink className="size-4" />
      Открыть материал
    </a>
  );
}
