import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";

// Кнопка голосового ввода. Где браузер умеет распознавать речь — пишем прямо
// в текст. Запись НЕПРЕРЫВНАЯ: идёт, пока не нажмёшь «стоп». Даже если движок
// сам обрывается по тишине — мы перезапускаем его, пока запись активна.
// На айфоне/айпаде Safari без поддержки — подсказываем микрофон на клавиатуре.

type RecResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((e: { resultIndex: number; results: ArrayLike<RecResult> }) => void)
    | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function makeRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = "ru-RU";
  r.interimResults = true;
  r.continuous = true;
  return r;
}

/** Кнопка «говорить». onResult дозаписывает распознанные фрагменты. */
export function VoiceInput({
  onResult,
  className = "",
}: {
  onResult: (text: string) => void;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const activeRef = useRef(false);
  const [supported] = useState(
    () => typeof window !== "undefined" && makeRecognition() !== null,
  );

  useEffect(
    () => () => {
      activeRef.current = false;
      recRef.current?.stop();
    },
    [],
  );

  const stop = () => {
    activeRef.current = false;
    setListening(false);
    setInterim("");
    recRef.current?.stop();
  };

  const start = () => {
    const rec = makeRecognition();
    if (!rec) return;
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? "";
        if (r.isFinal) {
          if (t.trim()) onResult(t.trim());
        } else {
          live += t;
        }
      }
      setInterim(live);
    };
    rec.onerror = (ev) => {
      if (ev?.error === "not-allowed" || ev?.error === "service-not-allowed") {
        toast.info("Разрешите доступ к микрофону, чтобы говорить голосом.");
        stop();
      }
      // «no-speech»/«aborted» — не страшно: onend перезапустит запись.
    };
    rec.onend = () => {
      setInterim("");
      // Пока запись активна — продолжаем, даже если движок сам оборвался.
      if (activeRef.current) {
        try {
          rec.start();
        } catch {
          /* уже стартует — игнор */
        }
      } else {
        setListening(false);
      }
    };
    recRef.current = rec;
    activeRef.current = true;
    setListening(true);
    try {
      rec.start();
    } catch {
      /* игнор */
    }
  };

  const toggle = () => {
    if (!supported) {
      toast.info(
        "Здесь голос не поддерживается. Нажмите значок микрофона на клавиатуре — и просто наговорите текст.",
      );
      return;
    }
    if (listening) stop();
    else start();
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-label={listening ? "Остановить запись" : "Говорить голосом"}
        className={`inline-flex items-center gap-2 text-sm font-medium rounded-full px-4 py-2.5 transition-colors ${
          listening
            ? "bg-rose text-white"
            : "bg-cream ring-1 ring-border text-foreground"
        }`}
      >
        {listening ? (
          <>
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-white" />
            </span>
            Идёт запись — нажмите, чтобы остановить
            <Square className="size-3.5 fill-current" />
          </>
        ) : (
          <>
            <Mic className="size-4" />
            Говорить голосом
          </>
        )}
      </button>
      {listening && (
        <p className="text-xs text-muted-foreground italic leading-relaxed min-h-4">
          {interim || "Говорите — я слушаю…"}
        </p>
      )}
    </div>
  );
}
