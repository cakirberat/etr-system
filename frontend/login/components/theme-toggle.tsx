"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

type Props = {
  className?: string
}

export function ThemeToggle({ className = "" }: Props) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground ${className}`}
      aria-label={theme === "light" ? "Karanlık temaya geç" : "Aydınlık temaya geç"}
      title={theme === "light" ? "Karanlık tema" : "Aydınlık tema"}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}
