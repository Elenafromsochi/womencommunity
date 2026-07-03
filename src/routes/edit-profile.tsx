import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { useAppStore } from "../lib/store";
import { resizeImageToDataUrl } from "../lib/image";
import { toast } from "sonner";

export const Route = createFileRoute("/edit-profile")({
  head: () => ({ meta: [{ title: "Женское общество — Редактировать профиль" }] }),
  component: EditProfilePage,
});

function EditProfilePage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState(profile.avatar);
  const [name, setName] = useState(profile.name);
  const [city, setCity] = useState(profile.city);
  const [about, setAbout] = useState(profile.about ?? "");
  const [busy, setBusy] = useState(false);

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 256);
      setAvatar(dataUrl);
    } catch {
      toast.error("Не удалось загрузить фото");
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    updateProfile({
      avatar,
      name: name.trim() || profile.name,
      city: city.trim(),
      about: about.trim(),
    });
    toast.success("Профиль сохранён");
    navigate({ to: "/profile" });
  };

  return (
    <div className="px-6 space-y-8 pb-6">
      <button
        onClick={() => navigate({ to: "/profile" })}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Профиль
      </button>

      <h1 className="font-[Lora] text-2xl">Редактировать профиль</h1>

      {/* Аватар */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative size-28 rounded-full bg-cream ring-1 ring-border overflow-hidden flex items-center justify-center"
        >
          {avatar ? (
            <img src={avatar} alt="Аватар" className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">👩</span>
          )}
          <span className="absolute bottom-0 inset-x-0 bg-foreground/60 text-primary-foreground py-1 flex items-center justify-center">
            <Camera className="size-4" />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickPhoto(e.target.files?.[0])}
        />
        <span className="text-xs text-muted-foreground">
          {busy ? "Загрузка…" : "Нажмите на фото, чтобы изменить"}
        </span>
      </div>

      {/* Поля */}
      <div className="space-y-4">
        <Field label="Имя">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="Город">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoCapitalize="words"
            placeholder="Ваш город"
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="О себе">
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            autoCapitalize="sentences"
            autoCorrect="on"
            spellCheck
            inputMode="text"
            placeholder="Пара слов о себе — чем живёте, что важно"
            style={{ textTransform: "none" }}
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </Field>
      </div>

      <button
        onClick={save}
        className="w-full bg-foreground text-primary-foreground text-sm font-medium py-3.5 rounded-full"
      >
        Сохранить
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
