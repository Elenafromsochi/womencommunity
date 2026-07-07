import { useAppStore } from "./store";
import { contentItems, events, mentors } from "./mock-data";
import type { ContentItem, Event, Mentor } from "./types";

// Ленты клуба = материалы/события клуба + опубликованные экспертом.
// Свои — сверху, чтобы участница сразу видела новое.

export function useAllContent(): ContentItem[] {
  const mine = useAppStore((s) => s.myMaterials);
  return [...mine, ...contentItems];
}

export function useAllEvents(): Event[] {
  const mine = useAppStore((s) => s.myEvents);
  return [...mine, ...events];
}

/** Наставники клуба + опубликованная экспертная страница текущего пользователя. */
export function useAllMentors(): Mentor[] {
  const profile = useAppStore((s) => s.profile);
  const ep = useAppStore((s) => s.expertProfile);
  const myMaterials = useAppStore((s) => s.myMaterials);
  const myEvents = useAppStore((s) => s.myEvents);
  if (!ep.published || !ep.specialization) return mentors;
  const me: Mentor = {
    id: "me",
    name: profile.name || "Наставник",
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
  };
  return [me, ...mentors];
}
