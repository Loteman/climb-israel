import { useEffect, useRef, useState } from "preact/hooks";

type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "climb-israel-theme";

function applyTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") {
      localStorage.removeItem(STORAGE_KEY);
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem(STORAGE_KEY, choice);
      document.documentElement.setAttribute("data-theme", choice);
    }
  } catch {
    /* localStorage unavailable (private mode etc.) - theme just won't persist */
  }
}

function readStoredTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "system";
}

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "לפי הגדרות המכשיר" },
  { value: "light", label: "בהיר" },
  { value: "dark", label: "כהה" },
];

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChoice(readStoredTheme());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (value: ThemeChoice) => {
    setChoice(value);
    applyTheme(value);
  };

  return (
    <div class="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        class="flex items-center gap-2 rounded-sm border border-dashed border-stone px-3 py-1.5 font-body text-sm font-semibold text-ink hover:border-rust hover:text-rust"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.3"></circle>
          <path
            d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4M12.5 12.5l-1.4-1.4M4.9 4.9 3.5 3.5"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
          ></path>
        </svg>
        תצוגה
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="הגדרות תצוגה"
          class="absolute end-0 top-full z-50 mt-2 w-60 border border-stone/50 bg-paper-dark p-3 shadow-lg"
        >
          <p class="font-body text-xs font-bold uppercase tracking-wide text-ink-soft">
            מצב תצוגה
          </p>
          <div class="mt-2 flex flex-col gap-1">
            {OPTIONS.map((opt) => (
              <button
                type="button"
                onClick={() => select(opt.value)}
                class={`flex items-center gap-2 rounded-sm px-2 py-2 text-start font-body text-sm ${
                  choice === opt.value
                    ? "bg-paper font-bold text-rope"
                    : "text-ink hover:bg-paper"
                }`}
              >
                <span
                  class={`block h-3 w-3 shrink-0 rounded-full border-2 ${
                    choice === opt.value ? "border-rope bg-rope" : "border-stone bg-transparent"
                  }`}
                  aria-hidden="true"
                ></span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
