import { createContext } from "react";

export type Theme = "dark" | "light" | "system";
export type Accent = "violet" | "blue" | "emerald" | "rose" | "amber" | "cyan" | "orange";

export interface ThemeContextValue {
  theme: Theme;
  accent: Accent;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ACCENTS: { value: Accent; label: string; hsl: string }[] = [
  { value: "violet", label: "Violet", hsl: "262 83% 58%" },
  { value: "blue", label: "Blue", hsl: "217 91% 60%" },
  { value: "emerald", label: "Emerald", hsl: "160 84% 39%" },
  { value: "rose", label: "Rose", hsl: "347 77% 55%" },
  { value: "amber", label: "Amber", hsl: "32 95% 50%" },
  { value: "cyan", label: "Cyan", hsl: "189 94% 43%" },
  { value: "orange", label: "Orange", hsl: "21 90% 55%" },
];
