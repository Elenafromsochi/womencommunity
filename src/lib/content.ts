import { useAppStore } from "./store";
import { contentItems, events, mentors } from "./mock-data";
import { mastermindToEvent } from "./payments";
import type { ContentItem, Event, Mentor } from "./types";

// Ленты клуба = одобренные материалы из общей базы + материалы клуба.
// Одобренные (свежие) — сверху, чтобы участница сразу видела новое.

export function useAllContent(): ContentItem[] {
  const approved = useAppStore((s) => s.approvedMaterials);
  return [...approved, ...contentItems];
}

/**
 * Найти материал по id для страницы материала. Помимо ленты включает свои
 * материалы эксперта (в т.ч. на модерации/отклонённые), чтобы он мог открыть
 * карточку из кабинета до одобрения.
 */
export function useContentById(id: string): ContentItem | undefined {
  const approved = useAppStore((s) => s.approvedMaterials);
  const mine = useAppStore((s) => s.myMaterialRecords);
  return [...mine, ...approved, ...contentItems].find((c) => c.id === id);
}

export function useAllEvents(): Event[] {
  const mine = useAppStore((s) => s.myEvents);
  const masterminds = useAppStore((s) => s.masterminds);
  return [...masterminds.map(mastermindToEvent), ...mine, ...events];
}

/** Наставники клуба + опубликованная экспертная страница текущего пользователя. */
export function useAllMentors(): Mentor[] {
  const profile = useAppStore((s) => s.profile);
  const ep = useAppStore((s) => s.expertProfile);
  const userId = useAppStore((s) => s.userId);
  const myMaterials = useAppStore((s) => s.myMaterialRecords);
  const myEvents = useAppStore((s) => s.myEvents);
  if (!ep.published || !ep.specialization) return mentors;
  const me: Mentor = {
    id: "me",
    name: profile.name || "Эксперт",
    specialization: ep.specialization,
    description: ep.tagline || ep.offer || "",
    topics: ep.topics ?? [],
    rating: 0,
    reviews: 0,
    materialsCount: myMaterials.length,
    events: myEvents.map((e) => ({
      id: e.id,
      title: e.title,
      mentor: e.mentor,
      date: e.date,
      time: e.time,
      type: e.type,
      price: e.price,
      cover: e.cover,
    })),
    groups: [],
    avatar: profile.avatar,
    experience: ep.about ?? "",
    contact: ep.contact,
    userId: userId ?? undefined,
  };
  return [me, ...mentors];
}
