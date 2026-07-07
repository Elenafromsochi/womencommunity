import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, FileText, Calendar } from "lucide-react";
import { useAppStore } from "../lib/store";
import { LinkOrUpload } from "../components/LinkOrUpload";
import type { ContentType } from "../lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/mentor")({
  head: () => ({
    meta: [
      { title: "Женское общество — Кабинет наставника" },
      { name: "description", content: "Интерфейс наставника" },
    ],
  }),
  component: MentorDashboard,
});

const TOPICS = [
  "Состояние",
  "Здоровье",
  "Личностный рост",
  "Материнство",
  "Отношения",
  "Самореализация",
  "Финансы",
];

const TYPES: { key: ContentType; label: string }[] = [
  { key: "article", label: "Статья" },
  { key: "video", label: "Видео" },
  { key: "audio", label: "Аудио" },
  { key: "collection", label: "Подборка" },
];

const field =
  "w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary";

function MentorDashboard() {
  const [tab, setTab] = useState<"material" | "event">("material");

  const myMaterials = useAppStore((s) => s.myMaterials);
  const addMyMaterial = useAppStore((s) => s.addMyMaterial);
  const removeMyMaterial = useAppStore((s) => s.removeMyMaterial);
  const myEvents = useAppStore((s) => s.myEvents);
  const addMyEvent = useAppStore((s) => s.addMyEvent);
  const removeMyEvent = useAppStore((s) => s.removeMyEvent);

  // Форма материала
  const [mTitle, setMTitle] = useState("");
  const [mType, setMType] = useState<ContentType>("article");
  const [mTopic, setMTopic] = useState(TOPICS[0]);
  const [mDuration, setMDuration] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mBody, setMBody] = useState("");
  const [mMedia, setMMedia] = useState("");
  const [mCover, setMCover] = useState("");
  // Примерное время чтения статьи по числу слов (~170 слов/мин).
  const readingMin = Math.max(
    1,
    Math.round(mBody.trim().split(/\s+/).filter(Boolean).length / 170),
  );

  // Форма мероприятия
  const [eTitle, setETitle] = useState("");
  const [eDate, setEDate] = useState("");
  const [eTime, setETime] = useState("");
  const [eType, setEType] = useState<"online" | "offline">("online");
  const [ePlace, setEPlace] = useState("");
  const [eDesc, setEDesc] = useState("");

  const publishMaterial = () => {
    if (!mTitle.trim() || !mDesc.trim()) return;
    addMyMaterial({
      title: mTitle.trim(),
      type: mType,
      topic: mTopic,
      description: mDesc.trim(),
      body: mBody.trim() ? mBody.trim().split(/\n+/) : undefined,
      duration:
        mType === "article" && mBody.trim()
          ? `${readingMin} мин чтения`
          : mDuration.trim() || undefined,
      mediaUrl: mMedia.trim() || undefined,
      cover: mCover.trim() || undefined,
    });
    setMTitle("");
    setMDesc("");
    setMBody("");
    setMDuration("");
    setMMedia("");
    setMCover("");
    toast.success("Материал опубликован — он уже в ленте клуба");
  };

  const publishEvent = () => {
    if (!eTitle.trim() || !eDate.trim() || !eTime.trim()) return;
    addMyEvent({
      title: eTitle.trim(),
      date: eDate.trim(),
      time: eTime.trim(),
      description: eDesc.trim(),
      type: eType,
      location: ePlace.trim() || undefined,
    });
    setETitle("");
    setEDate("");
    setETime("");
    setEPlace("");
    setEDesc("");
    toast.success("Мероприятие создано — оно уже в «Событиях»");
  };

  return (
    <div className="px-6 space-y-6 pb-8 min-h-[100dvh]">
      <div className="pt-2 flex items-center gap-3">
        <Link
          to="/profile"
          className="size-10 rounded-full bg-card flex items-center justify-center ring-1 ring-border"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span className="font-[Lora] text-lg">Кабинет наставника</span>
      </div>

      <div className="bg-cream p-5 rounded-[2rem] ring-1 ring-border">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Здесь вы создаёте пользу для клуба. Всё, что вы публикуете, сразу
          появляется у участниц — в ленте на главной, в темах и «Событиях».
        </p>
      </div>

      {/* Табы */}
      <div className="flex gap-2 bg-card ring-1 ring-border rounded-full p-1">
        {[
          { key: "material" as const, label: "Материалы", Icon: FileText },
          { key: "event" as const, label: "Мероприятия", Icon: Calendar },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <t.Icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "material" && (
        <>
          <section className="bg-card ring-1 ring-border rounded-[2rem] p-5 space-y-3">
            <h2 className="font-[Lora] text-lg">Новый материал</h2>
            <input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="Название" className={field} />
            <div className="grid grid-cols-2 gap-2">
              <select value={mType} onChange={(e) => setMType(e.target.value as ContentType)} className={field}>
                {TYPES.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
              <select value={mTopic} onChange={(e) => setMTopic(e.target.value)} className={field}>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <textarea value={mDesc} onChange={(e) => setMDesc(e.target.value)} rows={2} placeholder="Очень кратко, одним предложением — что это и зачем" style={{ textTransform: "none" }} className={`${field} resize-none`} />

            {/* Статья: текст или файл-документ */}
            {mType === "article" && (
              <>
                <textarea value={mBody} onChange={(e) => setMBody(e.target.value)} rows={7} placeholder="Текст статьи — абзацы с новой строки" style={{ textTransform: "none" }} className={`${field} resize-none`} />
                {mBody.trim() && (
                  <p className="text-[11px] text-muted-foreground px-1">≈ {readingMin} мин чтения — посчитаем сами</p>
                )}
                <div>
                  <p className="text-xs font-medium mb-1.5">…или загрузите документ (PDF)</p>
                  <LinkOrUpload value={mMedia} onChange={setMMedia} folder="media" accept="application/pdf" placeholder="Ссылка на PDF (необязательно)" hint="Если это PDF — статья откроется документом, участница сможет сохранить и распечатать." />
                </div>
              </>
            )}

            {/* Видео */}
            {mType === "video" && (
              <div>
                <p className="text-xs font-medium mb-1.5">Видео</p>
                <LinkOrUpload value={mMedia} onChange={setMMedia} folder="media" accept="video/*" placeholder="Ссылка на видео (YouTube, Rutube, VK Видео…)" hint="Вставьте ссылку — будет встроенный плеер. Или загрузите свой видеофайл." onDuration={setMDuration} />
              </div>
            )}

            {/* Аудио */}
            {mType === "audio" && (
              <div>
                <p className="text-xs font-medium mb-1.5">Аудио</p>
                <LinkOrUpload value={mMedia} onChange={setMMedia} folder="media" accept="audio/*" placeholder="Ссылка на аудио (Яндекс Музыка, файл .mp3…)" hint="Вставьте ссылку или загрузите файл — длительность посчитаем сами." onDuration={setMDuration} />
                {mDuration && <p className="text-[11px] text-muted-foreground px-1">Длительность: {mDuration}</p>}
              </div>
            )}

            {/* Подборка: текст + любое медиа */}
            {mType === "collection" && (
              <>
                <textarea value={mBody} onChange={(e) => setMBody(e.target.value)} rows={5} placeholder="Описание подборки — абзацы с новой строки" style={{ textTransform: "none" }} className={`${field} resize-none`} />
                <div>
                  <p className="text-xs font-medium mb-1.5">Медиа (необязательно)</p>
                  <LinkOrUpload value={mMedia} onChange={setMMedia} folder="media" accept="audio/*,video/*,application/pdf" placeholder="Ссылка или файл (видео, аудио, PDF)" onDuration={setMDuration} />
                </div>
              </>
            )}

            {/* Обложка */}
            <div>
              <p className="text-xs font-medium mb-1.5">Обложка (необязательно)</p>
              <LinkOrUpload value={mCover} onChange={setMCover} folder="covers" accept="image/*" placeholder="Ссылка на картинку" hint="Нет обложки? Подставим красивую в едином стиле клуба." />
            </div>
            <button
              onClick={publishMaterial}
              disabled={!mTitle.trim() || !mDesc.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-full disabled:opacity-40"
            >
              <Plus className="size-4" />
              Опубликовать
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-[Lora] text-lg">Мои материалы</h2>
            {myMaterials.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Пока ничего не опубликовано.</p>
            ) : (
              myMaterials.map((c) => (
                <div key={c.id} className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-center gap-3">
                  <Link to="/material/$id" params={{ id: c.id }} className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.topic}{c.duration ? ` · ${c.duration}` : ""}</p>
                  </Link>
                  <Link to="/material/$id" params={{ id: c.id }} aria-label="Открыть" className="text-muted-foreground">
                    <ArrowRight className="size-4" />
                  </Link>
                  <button onClick={() => { removeMyMaterial(c.id); toast.success("Удалено"); }} aria-label="Удалить" className="text-muted-foreground/50 hover:text-rose">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </section>
        </>
      )}

      {tab === "event" && (
        <>
          <section className="bg-card ring-1 ring-border rounded-[2rem] p-5 space-y-3">
            <h2 className="font-[Lora] text-lg">Новое мероприятие</h2>
            <input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="Название встречи" className={field} />
            <div className="grid grid-cols-2 gap-2">
              <input value={eDate} onChange={(e) => setEDate(e.target.value)} placeholder="Дата, напр. 20 июля" className={field} />
              <input value={eTime} onChange={(e) => setETime(e.target.value)} placeholder="Время, напр. 19:00" className={field} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={eType} onChange={(e) => setEType(e.target.value as "online" | "offline")} className={field}>
                <option value="online">Онлайн</option>
                <option value="offline">Очно</option>
              </select>
              <input value={ePlace} onChange={(e) => setEPlace(e.target.value)} placeholder="Место / ссылка" className={field} />
            </div>
            <textarea value={eDesc} onChange={(e) => setEDesc(e.target.value)} rows={4} placeholder="О чём встреча" style={{ textTransform: "none" }} className={`${field} resize-none`} />
            <button
              onClick={publishEvent}
              disabled={!eTitle.trim() || !eDate.trim() || !eTime.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-full disabled:opacity-40"
            >
              <Plus className="size-4" />
              Создать
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="font-[Lora] text-lg">Мои мероприятия</h2>
            {myEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Пока нет мероприятий.</p>
            ) : (
              myEvents.map((e) => (
                <div key={e.id} className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-center gap-3">
                  <Link to="/events/$eventId" params={{ eventId: e.id }} className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.date} · {e.time}</p>
                  </Link>
                  <Link to="/events/$eventId" params={{ eventId: e.id }} aria-label="Открыть" className="text-muted-foreground">
                    <ArrowRight className="size-4" />
                  </Link>
                  <button onClick={() => { removeMyEvent(e.id); toast.success("Удалено"); }} aria-label="Удалить" className="text-muted-foreground/50 hover:text-rose">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </section>
        </>
      )}

      <div className="text-center py-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary font-medium">
          Вернуться к интерфейсу участницы
        </Link>
      </div>
    </div>
  );
}
