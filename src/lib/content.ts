import { useAppStore } from "./store";
import { contentItems, events } from "./mock-data";
import type { ContentItem, Event } from "./types";

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
