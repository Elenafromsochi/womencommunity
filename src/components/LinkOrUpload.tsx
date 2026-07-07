import { useRef, useState } from "react";
import { Upload, Check, Loader2 } from "lucide-react";
import { uploadFile } from "../lib/upload";
import { toast } from "sonner";

const field =
  "w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm normal-case placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary";

/** Поле «вставить ссылку ИЛИ загрузить файл». Значение — итоговая ссылка. */
export function LinkOrUpload({
  value,
  onChange,
  placeholder,
  accept,
  folder,
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
  accept?: string;
  folder: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
      setUploaded(file.name);
      toast.success("Файл загружен");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось загрузить файл");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setUploaded(null);
        }}
        inputMode="url"
        placeholder={placeholder}
        className={field}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-2 bg-cream ring-1 ring-border text-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : uploaded ? <Check className="size-3.5 text-accent" /> : <Upload className="size-3.5" />}
          {busy ? "Загрузка…" : uploaded ? "Загружено" : "Загрузить файл"}
        </button>
        {uploaded && <span className="text-[11px] text-muted-foreground truncate">{uploaded}</span>}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground px-1">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
