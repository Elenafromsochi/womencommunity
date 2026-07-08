import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Eye, X, Pencil } from "lucide-react";
import { useAppStore } from "../lib/store";
import { LinkOrUpload } from "../components/LinkOrUpload";
import { MediaEmbed } from "../components/MediaEmbed";
import { CoverPlaceholder } from "../components/CoverPlaceholder";
import { parseMedia } from "../lib/embed";
import { insertMaterial, deleteMaterial, loadSharedMaterials } from "../lib/materials-db";
import type { ContentType, MaterialStatus } from "../lib/types";
import { toast } from "sonner";

// Подпись статуса материала для эксперта.
const STATUS_BADGE: Record<MaterialStatus, { label: string; cls: string }> = {
  pending: { label: "На модерации", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Опубликован", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Отклонён", cls: "bg-rose-100 text-rose-700" },
};

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
];

const field =
  "w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary";

function MentorDashboard() {
  // Раздел — из хэша адреса (нижняя навигация переключает Материалы/События).
  const { location } = useRouterState();
  const tab = location.hash === "event" ? "event" : "material";

  const myMaterials = useAppStore((s) => s.myMaterialRecords);
  const userId = useAppStore((s) => s.userId);
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
  const [showMForm, setShowMForm] = useState(false);
  const [showEForm, setShowEForm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const profile = useAppStore((s) => s.profile);
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
  const [ePrice, setEPrice] = useState("");
  const [eSpots, setESpots] = useState("");
  const [ePayUrl, setEPayUrl] = useState("");

  const publishMaterial = async () => {
    if (!mTitle.trim() || !mDesc.trim() || publishing) return;
    if (!userId) {
      toast.error("Не удалось определить аккаунт. Обновите страницу.");
      return;
    }
    setPublishing(true);
    const { error } = await insertMaterial({
      authorId: userId,
      authorName: profile.name || "Наставник",
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
    setPublishing(false);
    if (error) {
      toast.error("Не получилось отправить. Попробуйте ещё раз.");
      return;
    }
    await loadSharedMaterials(userId);
    setMTitle("");
    setMDesc("");
    setMBody("");
    setMDuration("");
    setMMedia("");
    setMCover("");
    setShowMForm(false);
    setPreview(false);
    toast.success("Отправлено на модерацию — администратор проверит и опубликует");
  };

  const handleDeleteMaterial = async (id: string) => {
    const { error } = await deleteMaterial(id);
    if (error) {
      toast.error("Не удалось удалить");
      return;
    }
    if (userId) await loadSharedMaterials(userId);
    toast.success("Удалено");
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
      price: ePrice.trim() ? Math.max(0, parseInt(ePrice, 10) || 0) : 0,
      spots: eSpots.trim() ? Math.max(1, parseInt(eSpots, 10) || 20) : undefined,
      paymentUrl: ePayUrl.trim() || undefined,
    });
    setETitle("");
    setEDate("");
    setETime("");
    setEPlace("");
    setEDesc("");
    setEPrice("");
    setESpots("");
    setEPayUrl("");
    setShowEForm(false);
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

      {tab === "material" && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-[Lora] text-xl">Мои материалы</h2>
            <button
              onClick={() => setShowMForm((v) => !v)}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full"
            >
              <Plus className="size-4" />
              {showMForm ? "Свернуть" : "Добавить"}
            </button>
          </div>

          {showMForm && (
          <section className="bg-card ring-1 ring-border rounded-[2rem] p-5 space-y-3">
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

            {/* Обложка */}
            <div>
              <p className="text-xs font-medium mb-1.5">Обложка (необязательно)</p>
              <LinkOrUpload value={mCover} onChange={setMCover} folder="covers" accept="image/*" placeholder="Ссылка на картинку" hint="Нет обложки? Подставим красивую в едином стиле клуба." />
            </div>
            <button
              onClick={() => setPreview(true)}
              disabled={!mTitle.trim() || !mDesc.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-full disabled:opacity-40"
            >
              <Eye className="size-4" />
              Предпросмотр карточки
            </button>
          </section>
          )}

          <div className="space-y-2">
            {myMaterials.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Пока ничего не опубликовано. Нажмите «Добавить».</p>
            ) : (
              myMaterials.map((c) => (
                <div key={c.id} className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-center gap-3">
                  <Link to="/material/$id" params={{ id: c.id }} className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status].cls}`}>
                        {STATUS_BADGE[c.status].label}
                      </span>
                      <p className="text-xs text-muted-foreground truncate">{c.topic}{c.duration ? ` · ${c.duration}` : ""}</p>
                    </div>
                    {c.status === "rejected" && c.rejectReason && (
                      <p className="text-[11px] text-rose mt-1">Причина: {c.rejectReason}</p>
                    )}
                  </Link>
                  <Link to="/material/$id" params={{ id: c.id }} aria-label="Открыть" className="text-muted-foreground">
                    <ArrowRight className="size-4" />
                  </Link>
                  <button onClick={() => handleDeleteMaterial(c.id)} aria-label="Удалить" className="text-muted-foreground/50 hover:text-rose">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === "event" && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-[Lora] text-xl">Мои мероприятия</h2>
            <button
              onClick={() => setShowEForm((v) => !v)}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full"
            >
              <Plus className="size-4" />
              {showEForm ? "Свернуть" : "Добавить"}
            </button>
          </div>

          {showEForm && (
          <section className="bg-card ring-1 ring-border rounded-[2rem] p-5 space-y-3">
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
            <div className="grid grid-cols-2 gap-2">
              <input value={ePrice} onChange={(e) => setEPrice(e.target.value)} inputMode="numeric" placeholder="Цена, ₽ (0 — бесплатно)" className={field} />
              <input value={eSpots} onChange={(e) => setESpots(e.target.value)} inputMode="numeric" placeholder="Мест всего" className={field} />
            </div>
            {ePrice.trim() && ePrice.trim() !== "0" && (
              <div>
                <input value={ePayUrl} onChange={(e) => setEPayUrl(e.target.value)} inputMode="url" placeholder="Ссылка на оплату (ЮKassa, Продамус, бот…)" className={field} />
                <p className="text-[11px] text-muted-foreground px-1 mt-1">Участница нажмёт «Оплатить участие» и перейдёт по этой ссылке.</p>
              </div>
            )}
            <button
              onClick={publishEvent}
              disabled={!eTitle.trim() || !eDate.trim() || !eTime.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-full disabled:opacity-40"
            >
              <Plus className="size-4" />
              Создать
            </button>
          </section>
          )}

          <div className="space-y-2">
            {myEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Пока нет мероприятий. Нажмите «Добавить».</p>
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
          </div>
        </>
      )}

      {/* Предпросмотр карточки перед добавлением в ленту */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-3">
            <div className="w-full max-w-md bg-background rounded-[2rem] ring-1 ring-border overflow-hidden mb-24">
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Как увидят участницы
                </span>
                <button onClick={() => setPreview(false)} aria-label="Закрыть" className="text-muted-foreground">
                  <X className="size-5" />
                </button>
              </div>
              <div className="px-5 pb-5 space-y-4">
                {(() => {
                  const pv = parseMedia(mMedia);
                  return pv && pv.kind !== "link" ? (
                    <MediaEmbed url={mMedia} />
                  ) : mCover ? (
                    <img src={mCover} alt="" className="w-full aspect-video object-cover rounded-[2rem] ring-1 ring-border" />
                  ) : (
                    <div className="rounded-[2rem] overflow-hidden ring-1 ring-border aspect-video">
                      <CoverPlaceholder title={mTitle} topic={mTopic} type={mType} className="w-full h-full" />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-accent font-medium">
                    {TYPES.find((t) => t.key === mType)?.label} · {mTopic}
                    {mType === "article" && mBody.trim()
                      ? ` · ${readingMin} мин чтения`
                      : mDuration
                        ? ` · ${mDuration}`
                        : ""}
                  </p>
                  <h1 className="font-[Lora] text-2xl leading-tight mt-1">{mTitle}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{profile.name}</p>
                </div>
                {mDesc && <p className="text-sm text-muted-foreground leading-relaxed">{mDesc}</p>}
                {mBody.trim() && (
                  <div className="space-y-3">
                    {mBody.trim().split(/\n+/).map((p, i) => (
                      <p key={i} className="text-[15px] leading-relaxed text-foreground/90">{p}</p>
                    ))}
                  </div>
                )}
                {parseMedia(mMedia)?.kind === "link" && <MediaEmbed url={mMedia} />}
              </div>
              <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-3 flex gap-2">
                <button
                  onClick={() => setPreview(false)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-full text-sm ring-1 ring-border text-foreground"
                >
                  <Pencil className="size-4" />
                  Редактировать
                </button>
                <button
                  onClick={publishMaterial}
                  disabled={publishing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <Plus className="size-4" />
                  {publishing ? "Отправляем…" : "На модерацию"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center py-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary font-medium">
          Вернуться к интерфейсу участницы
        </Link>
      </div>
    </div>
  );
}
