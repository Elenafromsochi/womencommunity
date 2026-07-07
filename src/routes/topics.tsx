import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, BookOpen, Headphones, Video, Sparkles } from "lucide-react";
import { useState } from "react";
import { topics } from "../lib/mock-data";
import { useAllContent } from "../lib/content";
import type { ContentType } from "../lib/types";

export const Route = createFileRoute("/topics")({
  head: () => ({
    meta: [
      { title: "Женское общество — Темы" },
      { name: "description", content: "Каталог тем и материалов" },
    ],
  }),
  component: TopicsPage,
});

const typeIcons: Record<ContentType, React.ReactNode> = {
  article: <BookOpen className="size-4" />,
  audio: <Headphones className="size-4" />,
  video: <Video className="size-4" />,
  practice: <Sparkles className="size-4" />,
  collection: <BookOpen className="size-4" />,
};

const typeLabels: Record<ContentType, string> = {
  article: "Статья",
  audio: "Аудио",
  video: "Видео",
  practice: "Практика",
  collection: "Подборка",
};

function TopicsPage() {
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const contentItems = useAllContent();

  const filteredContent = contentItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = !selectedTopic || item.topic === topics.find((t) => t.id === selectedTopic)?.name;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="px-6 space-y-6 pb-4">
      {/* Title */}
      <h1 className="font-[Lora] text-3xl leading-tight">Темы</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по материалам..."
          className="w-full bg-card border border-border rounded-full pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {/* Topic categories */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setSelectedTopic(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            !selectedTopic
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/40"
          }`}
        >
          Все
        </button>
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() =>
              setSelectedTopic(topic.id === selectedTopic ? null : topic.id)
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              selectedTopic === topic.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {topic.emoji} {topic.name}
          </button>
        ))}
      </div>

      {/* Content list */}
      <div className="space-y-3">
        {filteredContent.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            По вашему запросу ничего не найдено
          </div>
        )}
        {filteredContent.map((item) => (
          <Link
            key={item.id}
            to="/material/$id"
            params={{ id: item.id }}
            className="bg-card p-4 rounded-[2rem] ring-1 ring-border flex gap-4"
          >
            <div className="size-14 shrink-0 rounded-[1.5rem] bg-cream flex items-center justify-center text-primary">
              {typeIcons[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] uppercase tracking-wider text-accent font-medium">
                  {typeLabels[item.type]}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {item.date}
                </span>
              </div>
              <h4 className="font-[Lora] text-base leading-tight truncate">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {item.author}
                {item.duration && ` • ${item.duration}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
