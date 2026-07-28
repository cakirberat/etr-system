"use client"

import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Page() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <LoginForm />
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p>{"© " + new Date().getFullYear() + " AKO GRUP. Tüm hakları saklıdır."}</p>
      </footer>
    </main>
  )
}

