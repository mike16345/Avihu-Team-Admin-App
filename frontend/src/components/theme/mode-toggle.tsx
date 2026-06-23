/**
 * ModeToggle — small square button used in the sidebar footer to flip
 * between light and dark themes. The border is intentionally thicker
 * (`border-2`) so the button reads as a distinct affordance next to
 * the label text.
 */
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      data-testid="sidebar-theme-toggle"
      aria-label={isDark ? "עבור למצב בהיר" : "עבור למצב כהה"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300 active:scale-95"
    >
      <Sun className="absolute h-[1.05rem] w-[1.05rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.05rem] w-[1.05rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
