import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAppStore } from "../lib/store";
import {
  SPHERES,
  sphereById,
  markersForSphere,
  markerById,
  computeLevel,
  DIAGNOSTIC_COPY,
} from "../lib/methodology";
import type { DiagnosticResult, SphereId } from "../lib/types";
import { Scale } from "../components/Scale";
import { Wreath } from "../components/Wreath";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Женское общество — Знакомство с собой" },
      { name: "description", content: "Входная диагностика женского сообщества" },
    ],
  }),
  component: OnboardingPage,
});

type Step =
  | "welcome"
  | "intro"
  | "about"
  | "energy"
  | "agency"
  | "spheres"
  | "support"
  | "sphereScale"
  | "wellbeing"
  | "result";

// Шаги с прогрессом (без приветствия, интро и финала)
const PROGRESS_STEPS: Step[] = [
  "about",
  "energy",
  "agency",
  "spheres",
  "support",
  "sphereScale",
  "wellbeing",
];

function OnboardingPage() {
  const navigate = useNavigate();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const saveDiagnostic = useAppStore((s) => s.saveDiagnostic);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const [step, setStep] = useState<Step>("welcome");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [energy, setEnergy] = useState<number | null>(null);
  const [agency, setAgency] = useState<number | null>(null);
  const [selectedSpheres, setSelectedSpheres] = useState<SphereId[]>([]);
  const [supportSphere, setSupportSphere] = useState<SphereId | null>(null);
  const [supportScore, setSupportScore] = useState<number | null>(null);
  const [chosenMarkers, setChosenMarkers] = useState<string[]>([]);
  const [wellbeing, setWellbeing] = useState<number | null>(null);

  const go = (s: Step) => setStep(s);

  const skip = () => {
    setOnboardingComplete(true);
    navigate({ to: "/" });
  };

  const toggleSphere = (id: SphereId) => {
    setSelectedSpheres((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleMarker = (id: string) => {
    setChosenMarkers((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) {
        toast.info("Достаточно 1–2 маркеров для начала");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleComplete = () => {
    const result: DiagnosticResult = {
      date: new Date().toISOString(),
      energy: energy ?? 5,
      agency: agency ?? 5,
      selectedSpheres,
      supportSphere: supportSphere ?? selectedSpheres[0],
      supportSphereScore: supportScore ?? 5,
      chosenMarkers,
      wellbeing: wellbeing ?? 5,
    };
    saveDiagnostic(result);
    updateProfile({
      name: name.trim() || "Елена",
      city: city.trim() || "Москва",
      interests: selectedSpheres.map((id) => sphereById(id).name),
      priorities: result.supportSphere ? [sphereById(result.supportSphere).name] : [],
    });
    setOnboardingComplete(true);
    go("result");
  };

  // --- gating ---
  const canContinue: Record<Step, boolean> = {
    welcome: true,
    intro: true,
    about: name.trim().length > 0,
    energy: energy !== null,
    agency: agency !== null,
    spheres: selectedSpheres.length > 0,
    support: supportSphere !== null,
    sphereScale: supportScore !== null && chosenMarkers.length > 0,
    wellbeing: wellbeing !== null,
    result: true,
  };

  const progressIndex = PROGRESS_STEPS.indexOf(step);

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 pb-6">
      {/* Прогресс */}
      {progressIndex >= 0 && (
        <div className="pt-5 pb-6">
          <div className="flex gap-1.5">
            {PROGRESS_STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= progressIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== Welcome ===== */}
      {step === "welcome" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="size-20 rounded-full bg-cream flex items-center justify-center ring-1 ring-border">
            <span className="text-4xl">🌸</span>
          </div>
          <div>
            <h1 className="font-[Lora] text-3xl leading-tight">
              Добро пожаловать в <span className="italic">Женское общество</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-[290px] mx-auto leading-relaxed">
              Это не тест и не оценка. Это знакомство с собой — мягкое зеркало,
              чтобы увидеть, где вы сейчас и куда хочется.
            </p>
          </div>
          <PrimaryButton onClick={() => go("intro")}>
            Познакомиться с собой <ArrowRight className="size-4" />
          </PrimaryButton>
          <button onClick={skip} className="text-xs text-muted-foreground hover:text-foreground">
            Пропустить
          </button>
        </div>
      )}

      {/* ===== Intro ===== */}
      {step === "intro" && (
        <div className="flex-1 flex flex-col">
          <BackButton onClick={() => go("welcome")} />
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <h1 className="font-[Lora] text-2xl leading-snug">Что мы сделаем</h1>
            <div className="space-y-4">
              <IntroPoint emoji="🌿" title="Найдём главное">
                Какой сфере жизни сейчас нужно ваше внимание.
              </IntroPoint>
              <IntroPoint emoji="🕊️" title="Первый шаг">
                Выберем 1–2 простых действия, с которых начать.
              </IntroPoint>
              <IntroPoint emoji="🌱" title="Увидим рост">
                Будете замечать, как в этой сфере становится лучше.
              </IntroPoint>
            </div>
          </div>
          <PrimaryButton full onClick={() => go("about")}>
            Хорошо, начнём <ArrowRight className="size-4" />
          </PrimaryButton>
        </div>
      )}

      {/* ===== About ===== */}
      {step === "about" && (
        <StepFrame
          onBack={() => go("intro")}
          title="Как к вам обращаться?"
          hint="Совсем немного — чтобы клуб был тёплым и личным."
          canContinue={canContinue.about}
          onContinue={() => go("energy")}
        >
          <div className="space-y-4">
            <InputField label="Имя" value={name} onChange={setName} placeholder="Ваше имя" />
            <InputField label="Город" value={city} onChange={setCity} placeholder="Необязательно" />
          </div>
        </StepFrame>
      )}

      {/* ===== Energy ===== */}
      {step === "energy" && (
        <StepFrame
          onBack={() => go("about")}
          title={DIAGNOSTIC_COPY.energy.title}
          hint={DIAGNOSTIC_COPY.energy.hint}
          canContinue={canContinue.energy}
          onContinue={() => go("agency")}
        >
          <Scale
            value={energy}
            onChange={setEnergy}
            lowLabel={DIAGNOSTIC_COPY.energy.low}
            highLabel={DIAGNOSTIC_COPY.energy.high}
          />
        </StepFrame>
      )}

      {/* ===== Agency ===== */}
      {step === "agency" && (
        <StepFrame
          onBack={() => go("energy")}
          title={DIAGNOSTIC_COPY.agency.title}
          hint={DIAGNOSTIC_COPY.agency.hint}
          canContinue={canContinue.agency}
          onContinue={() => go("spheres")}
        >
          <Scale
            value={agency}
            onChange={setAgency}
            lowLabel={DIAGNOSTIC_COPY.agency.low}
            highLabel={DIAGNOSTIC_COPY.agency.high}
          />
        </StepFrame>
      )}

      {/* ===== Spheres ===== */}
      {step === "spheres" && (
        <StepFrame
          onBack={() => go("agency")}
          title={DIAGNOSTIC_COPY.spheres.title}
          hint={DIAGNOSTIC_COPY.spheres.hint}
          canContinue={canContinue.spheres}
          onContinue={() => {
            // если опорная больше не среди выбранных — сбросим
            if (supportSphere && !selectedSpheres.includes(supportSphere)) {
              setSupportSphere(null);
            }
            go("support");
          }}
        >
          <div className="flex flex-wrap gap-2.5">
            {SPHERES.map((sphere) => {
              const selected = selectedSpheres.includes(sphere.id);
              return (
                <button
                  key={sphere.id}
                  onClick={() => toggleSphere(sphere.id)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  <span className="mr-1.5">{sphere.emoji}</span>
                  {sphere.name}
                </button>
              );
            })}
          </div>
        </StepFrame>
      )}

      {/* ===== Support sphere ===== */}
      {step === "support" && (
        <StepFrame
          onBack={() => go("spheres")}
          title={DIAGNOSTIC_COPY.support.title}
          hint={DIAGNOSTIC_COPY.support.hint}
          canContinue={canContinue.support}
          onContinue={() => go("sphereScale")}
        >
          <div className="space-y-2.5">
            {selectedSpheres.map((id) => {
              const sphere = sphereById(id);
              const active = supportSphere === id;
              return (
                <button
                  key={id}
                  onClick={() => setSupportSphere(id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl ring-1 transition-all text-left ${
                    active
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-card ring-border hover:ring-primary/30"
                  }`}
                >
                  <span
                    className="size-9 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ background: active ? "rgba(255,255,255,0.2)" : sphere.color }}
                  >
                    {sphere.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{sphere.name}</span>
                    <span
                      className={`block text-xs ${
                        active ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {sphere.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </StepFrame>
      )}

      {/* ===== Sphere scale + markers ===== */}
      {step === "sphereScale" && supportSphere && (
        <StepFrame
          onBack={() => go("support")}
          title={DIAGNOSTIC_COPY.sphereScale.title}
          hint={`Сфера «${sphereById(supportSphere).name}». ${DIAGNOSTIC_COPY.sphereScale.hint}`}
          canContinue={canContinue.sphereScale}
          onContinue={() => go("wellbeing")}
        >
          <div className="space-y-7">
            <Scale
              value={supportScore}
              onChange={setSupportScore}
              lowLabel={DIAGNOSTIC_COPY.sphereScale.low}
              highLabel={DIAGNOSTIC_COPY.sphereScale.high}
            />
            <div>
              <h3 className="font-[Lora] text-lg">{DIAGNOSTIC_COPY.markers.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                {DIAGNOSTIC_COPY.markers.hint}
              </p>
              <div className="flex flex-wrap gap-2">
                {markersForSphere(supportSphere).map((m) => {
                  const selected = chosenMarkers.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMarker(m.id)}
                      className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                        selected
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-card text-foreground border-border hover:border-accent/40"
                      }`}
                    >
                      {m.label}
                      <span
                        className={`ml-1.5 text-[10px] ${
                          selected ? "text-accent-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {markerKindLabel(m.kind)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </StepFrame>
      )}

      {/* ===== Wellbeing (хребтовый) ===== */}
      {step === "wellbeing" && (
        <StepFrame
          onBack={() => go("sphereScale")}
          title={DIAGNOSTIC_COPY.wellbeing.title}
          hint={DIAGNOSTIC_COPY.wellbeing.hint}
          canContinue={canContinue.wellbeing}
          continueLabel="Собрать мою карту"
          onContinue={handleComplete}
        >
          <Scale
            value={wellbeing}
            onChange={setWellbeing}
            lowLabel={DIAGNOSTIC_COPY.wellbeing.low}
            highLabel={DIAGNOSTIC_COPY.wellbeing.high}
          />
        </StepFrame>
      )}

      {/* ===== Result — карта результата ===== */}
      {step === "result" && supportSphere && (
        <ResultScreen
          name={name.trim() || "Елена"}
          energy={energy ?? 5}
          wellbeing={wellbeing ?? 5}
          supportSphere={supportSphere}
          supportScore={supportScore ?? 5}
          selectedSpheres={selectedSpheres}
          chosenMarkers={chosenMarkers}
          onEnter={() => navigate({ to: "/" })}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Карта результата
// ---------------------------------------------------------------------------
function ResultScreen({
  name,
  energy,
  wellbeing,
  supportSphere,
  supportScore,
  selectedSpheres,
  chosenMarkers,
  onEnter,
}: {
  name: string;
  energy: number;
  wellbeing: number;
  supportSphere: SphereId;
  supportScore: number;
  selectedSpheres: SphereId[];
  chosenMarkers: string[];
  onEnter: () => void;
}) {
  const lvl = computeLevel(0);
  return (
    <div className="flex-1 flex flex-col items-center text-center pt-2 pb-2 overflow-y-auto no-scrollbar">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Ваша карта
      </span>
      <h1 className="font-[Lora] text-2xl leading-tight mt-1">
        {name}, вот вы <span className="italic">сегодня</span>
      </h1>

      <Wreath
        className="my-2"
        size={290}
        supportSphere={supportSphere}
        selectedSpheres={selectedSpheres}
        supportScore={supportScore}
      />

      {/* Уровень */}
      <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-full">
        <span className="size-1.5 rounded-full bg-accent" />
        Уровень {lvl.level} · {lvl.title}
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 gap-3 w-full mt-6">
        <MiniStat label="Ресурс" value={`${energy}/10`} />
        <MiniStat label="Благополучие" value={`${wellbeing}/10`} />
      </div>

      {/* Маркеры */}
      {chosenMarkers.length > 0 && (
        <div className="w-full mt-3 bg-card ring-1 ring-border rounded-2xl p-4 text-left">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Мягко отмечаем
          </p>
          <div className="flex flex-wrap gap-2">
            {chosenMarkers.map((id) => (
              <span
                key={id}
                className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent"
              >
                {markerById(id)?.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-5 max-w-[280px] leading-relaxed">
        Это точка отсчёта. Дальше — маленькими шагами и в своём темпе. Такую
        сверку полезно повторять время от времени — мы мягко напомним.
      </p>

      <div className="w-full mt-5">
        <PrimaryButton full onClick={onEnter}>
          Войти в сообщество <ArrowRight className="size-4" />
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Мелкие компоненты
// ---------------------------------------------------------------------------
function StepFrame({
  title,
  hint,
  children,
  onBack,
  onContinue,
  canContinue,
  continueLabel = "Продолжить",
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
  continueLabel?: string;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-3">
        <h2 className="font-[Lora] text-2xl leading-tight">{title}</h2>
        {hint && <p className="text-sm text-muted-foreground mt-2">{hint}</p>}
      </div>
      <div className="flex-1 mt-6 overflow-y-auto no-scrollbar">{children}</div>
      <PrimaryButton full disabled={!canContinue} onClick={onContinue}>
        {continueLabel} <ArrowRight className="size-4" />
      </PrimaryButton>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  full,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  full?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${
        full ? "w-full" : ""
      } inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-8 py-3.5 rounded-full transition-opacity disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground self-start"
    >
      <ArrowLeft className="size-3.5" />
      Назад
    </button>
  );
}

function IntroPoint({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="size-10 shrink-0 rounded-full bg-cream flex items-center justify-center text-lg ring-1 ring-border">
        {emoji}
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card ring-1 ring-border rounded-2xl p-4 flex flex-col items-center">
      <span className="font-[Lora] text-xl">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      />
    </div>
  );
}

function markerKindLabel(kind: string): string {
  switch (kind) {
    case "event":
      return "факт";
    case "number":
      return "число";
    case "scale":
      return "шкала";
    case "frequency":
      return "частота";
    default:
      return "";
  }
}
