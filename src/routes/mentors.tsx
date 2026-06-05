import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Calendar, Star, Users } from "lucide-react";
import { mentors } from "../lib/mock-data";
import { useAppStore } from "../lib/store";

export const Route = createFileRoute("/mentors")({
  head: () => ({
    meta: [
      { title: "Женское общество — Наставники" },
      { name: "description", content: "Каталог наставниц сообщества" },
    ],
  }),
  component: MentorsPage,
});

function MentorsPage() {
  const savedMentorIds = useAppStore((s) => s.savedMentorIds);

  return (
    <div className="px-6 space-y-6 pb-4">
      <h1 className="font-[Lora] text-3xl leading-tight">Наставники</h1>
      <p className="text-sm text-muted-foreground">
        Эксперты, которые помогут вам на пути развития
      </p>

      <div className="space-y-4">
        {mentors.map((mentor) => (
          <Link
            key={mentor.id}
            to="/mentors/$mentorId"
            params={{ mentorId: mentor.id }}
            className="block bg-card p-5 rounded-[2.5rem] ring-1 ring-border hover:ring-primary/20 transition-all"
          >
            <div className="flex gap-4">
              <div className="size-16 shrink-0 rounded-full bg-cream flex items-center justify-center ring-1 ring-border/50 overflow-hidden">
                {mentor.avatar ? (
                  <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-2xl">👩‍⚕️</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-[Lora] text-lg leading-tight">
                      {mentor.name}
                    </h3>
                    <p className="text-xs text-accent font-medium mt-0.5">
                      {mentor.specialization}
                    </p>
                  </div>
                  {savedMentorIds.includes(mentor.id) && (
                    <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      В избранном
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {mentor.description}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3.5 text-primary fill-primary" />
                    {mentor.rating}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="size-3.5" />
                    {mentor.reviews}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {mentor.events.length} мероприятий
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  {mentor.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="text-[10px] px-2.5 py-1 bg-cream rounded-full text-muted-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
