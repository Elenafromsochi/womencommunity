import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

// Кнопка голосового ввода. Где браузер умеет распознавать речь
// (Chrome на Android/десктопе) — пишем прямо в текст. На айфоне/айпаде
// Safari этого не умеет, поэтому мягко подсказываем микрофон на клавиатуре
// (нативная диктовка iOS работает в любом поле).

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = "ru-RU";
  r.interimResults = false;
  r.continuous = false;
  return r;
}

/** Кнопка «говорить». onResult получает распознанный текст (дозаписью). */
export function VoiceInput({
  onResult,
  className = "",
}: {
  onResult: (text: string) => void;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => recRef.current?.stop();
  }, []);

  const supported = typeof window !== "undefined" && getRecognition() !== null;

  const toggle = () => {
    if (!supported) {
      toast.info(
        "Чтобы говорить голосом, нажмите значок микрофона на клавиатуре — и просто наговорите.",
      );
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    recRef.current = rec;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) onResult(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Остановить запись" : "Говорить голосом"}
      className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-2 transition-colors ${
        listening
          ? "bg-rose text-white"
          : "bg-cream ring-1 ring-border text-foreground"
      } ${className}`}
    >
      {listening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
      {listening ? "Слушаю…" : "Голосом"}
    </button>
  );
}
