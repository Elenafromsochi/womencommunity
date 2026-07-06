import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { contentItems, mentors } from "./mock-data";

// Превращаем в ответе помощника названия материалов и имена наставников
// в кликабельные ссылки (скрытые — видно только название/имя, но по нему
// можно перейти прямо к материалу или к карточке человека).

interface LinkTarget {
  text: string;
  render: (label: string, key: number) => ReactNode;
}

const LINK_CLASS =
  "underline underline-offset-2 decoration-primary-foreground/40 font-medium";

// Собираем один раз: сначала материалы, потом наставники. Сортируем по длине
// названия (сначала длинные), чтобы длинные совпадения не «съедались» короткими.
const TARGETS: LinkTarget[] = [
  ...contentItems.map((c) => ({
    text: c.title,
    render: (label: string, key: number) => (
      <Link key={key} to="/material/$id" params={{ id: c.id }} className={LINK_CLASS}>
        {label}
      </Link>
    ),
  })),
  ...mentors.map((m) => ({
    text: m.name,
    render: (label: string, key: number) => (
      <Link
        key={key}
        to="/mentors/$mentorId"
        params={{ mentorId: m.id }}
        className={LINK_CLASS}
      >
        {label}
      </Link>
    ),
  })),
]
  .filter((t) => t.text && t.text.length >= 3)
  .sort((a, b) => b.text.length - a.text.length);

/** Разбить текст ответа на части, подставив ссылки на известные материалы/людей. */
export function renderWithLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lower = text.toLowerCase();
  let i = 0;
  let key = 0;

  while (i < text.length) {
    let best: { start: number; len: number; target: LinkTarget } | null = null;
    for (const t of TARGETS) {
      const idx = lower.indexOf(t.text.toLowerCase(), i);
      if (idx === -1) continue;
      if (
        best === null ||
        idx < best.start ||
        (idx === best.start && t.text.length > best.len)
      ) {
        best = { start: idx, len: t.text.length, target: t };
      }
    }
    if (!best) {
      nodes.push(text.slice(i));
      break;
    }
    if (best.start > i) nodes.push(text.slice(i, best.start));
    const label = text.slice(best.start, best.start + best.len);
    nodes.push(best.target.render(label, key++));
    i = best.start + best.len;
  }

  return nodes;
}
