import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useAppStore } from "../lib/store";
import { interestOptions } from "../lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Женское общество — Добро пожаловать" },
      { name: "description", content: "Онбординг в женское сообщество" },
    ],
  }),
  component: OnboardingPage,
});

type Step = "welcome" | "survey" | "interests" | "complete";

function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const navigate = useNavigate();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const [survey, setSurvey] = useState({
    name: "",
    city: "",
    age: "",
    maritalStatus: "",
    occupation: "",
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      if (prev.length >= 3) {
        toast.info("Можно выбрать не более 3 тем");
        return prev;
      }
      return [...prev, interest];
    });
  };

  const handleComplete = () => {
    updateProfile({
      name: survey.name || "Елена",
      city: survey.city || "Москва",
      age: parseInt(survey.age) || 30,
      maritalStatus: survey.maritalStatus || "В браке",
      occupation: survey.occupation || "Маркетолог",
      interests: selectedInterests.length > 0 ? selectedInterests : ["отношения", "здоровье", "самореализация"],
      priorities: selectedInterests.length > 0 ? selectedInterests : ["отношения", "здоровье", "самореализация"],
    });
    setOnboardingComplete(true);
    setStep("complete");
  };

  return (
    <div className="min-h-[100dvh] px-6 flex flex-col">
      {/* Progress */}
      {step !== "welcome" && step !== "complete" && (
        <div className="pt-4 pb-6">
          <div className="flex gap-2">
            <div
              className={`h-1 flex-1 rounded-full ${
                step === "survey" || step === "interests"
                  ? "bg-primary"
                  : "bg-border"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${
                step === "interests" ? "bg-primary" : "bg-border"
              }`}
            />
          </div>
          {step === "survey" && (
            <button
              onClick={() => setStep("welcome")}
              className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Назад
            </button>
          )}
          {step === "interests" && (
            <button
              onClick={() => setStep("survey")}
              className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Назад
            </button>
          )}
        </div>
      )}

      {/* Welcome */}
      {step === "welcome" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="size-20 rounded-full bg-cream flex items-center justify-center ring-1 ring-border">
            <span className="text-4xl">🌸</span>
          </div>
          <div>
            <h1 className="font-[Lora] text-3xl leading-tight">
              Добро пожаловать в{" "}
              <span className="italic">Женское общество</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-[280px] mx-auto leading-relaxed">
              Пространство доверия, поддержки и развития. Знакомьтесь, учитесь,
              растите — вместе с единомышленницами.
            </p>
          </div>
          <button
            onClick={() => setStep("survey")}
            className="inline-flex items-center gap-2 bg-foreground text-primary-foreground text-sm font-medium px-8 py-3 rounded-full"
          >
            Начать знакомство
            <ArrowRight className="size-4" />
          </button>
          <button
            onClick={() => {
              setOnboardingComplete(true);
              navigate({ to: "/" });
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Пропустить
          </button>
        </div>
      )}

      {/* Survey */}
      {step === "survey" && (
        <div className="flex-1 flex flex-col space-y-6">
          <div>
            <h2 className="font-[Lora] text-2xl leading-tight">
              Расскажите о себе
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Это поможет подобрать для вас лучшие материалы и наставников
            </p>
          </div>
          <div className="space-y-4 flex-1">
            <InputField
              label="Имя"
              value={survey.name}
              onChange={(v) => setSurvey((s) => ({ ...s, name: v }))}
              placeholder="Как к вам обращаться?"
            />
            <InputField
              label="Город"
              value={survey.city}
              onChange={(v) => setSurvey((s) => ({ ...s, city: v }))}
              placeholder="Ваш город"
            />
            <InputField
              label="Возраст"
              value={survey.age}
              onChange={(v) => setSurvey((s) => ({ ...s, age: v }))}
              placeholder="Сколько вам лет?"
              type="number"
            />
            <InputField
              label="Семейное положение"
              value={survey.maritalStatus}
              onChange={(v) => setSurvey((s) => ({ ...s, maritalStatus: v }))}
              placeholder="Например: В браке, Одинока..."
            />
            <InputField
              label="Род деятельности"
              value={survey.occupation}
              onChange={(v) => setSurvey((s) => ({ ...s, occupation: v }))}
              placeholder="Кем вы работаете?"
            />
          </div>
          <button
            onClick={() => setStep("interests")}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-primary-foreground text-sm font-medium py-3.5 rounded-full mb-4"
          >
            Продолжить
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {/* Interests */}
      {step === "interests" && (
        <div className="flex-1 flex flex-col space-y-6">
          <div>
            <h2 className="font-[Lora] text-2xl leading-tight">
              Что для вас актуально?
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Выберите до 3 тем, которые сейчас наиболее важны
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 flex-1 content-start">
            {interestOptions.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
          <div className="text-center text-xs text-muted-foreground mb-2">
            Выбрано: {selectedInterests.length} / 3
          </div>
          <button
            onClick={handleComplete}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-primary-foreground text-sm font-medium py-3.5 rounded-full mb-4"
          >
            <Check className="size-4" />
            Готово
          </button>
        </div>
      )}

      {/* Complete */}
      {step === "complete" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="size-20 rounded-full bg-cream flex items-center justify-center ring-1 ring-border">
            <Check className="size-8 text-accent" />
          </div>
          <div>
            <h1 className="font-[Lora] text-3xl leading-tight">
              Прекрасно, <span className="italic">{survey.name || "Елена"}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-[280px] mx-auto leading-relaxed">
              Теперь мы знаем, чем вам помочь. Добро пожаловать в сообщество!
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-2 bg-foreground text-primary-foreground text-sm font-medium px-8 py-3 rounded-full"
          >
            Перейти в клуб
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      />
    </div>
  );
}
