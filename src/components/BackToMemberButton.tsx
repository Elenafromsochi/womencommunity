import { useNavigate } from "@tanstack/react-router";
import { useAppStore } from "../lib/store";

/**
 * Возврат из кабинета эксперта/куратора/администратора в интерфейс участницы.
 * ВАЖНО: переключает роль на «member», иначе останется чужая нижняя навигация
 * и фон — и кабинеты будут выглядеть перепутанными.
 */
export function BackToMemberButton({ className }: { className?: string }) {
  const setRole = useAppStore((s) => s.setRole);
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        setRole("member");
        navigate({ to: "/" });
      }}
      className={
        className ?? "inline-flex items-center gap-2 text-sm text-primary font-medium"
      }
    >
      Вернуться к интерфейсу участницы
    </button>
  );
}
