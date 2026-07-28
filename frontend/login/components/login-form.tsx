"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AkoLogo } from "@/components/ako-logo"
import { login } from "@/lib/api"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const username = String(form.get("username") ?? "")
    const password = String(form.get("password") ?? "")

    try {
      const result = await login(username, password)
      localStorage.setItem("token", result.token)
      localStorage.setItem("username", result.username)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl shadow-black/5">
      <CardHeader className="items-center gap-4 text-center">
        <div className="flex h-16 w-full items-center justify-center">
          <AkoLogo className="scale-125" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-semibold text-balance">
            Hesabınıza giriş yapın
          </CardTitle>
          <CardDescription className="text-pretty">
            Devam etmek için kurumsal bilgilerinizi girin
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Kullanıcı adı</Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                defaultValue="admin"
                placeholder="kullanici.adi"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Parola</Label>
              <a
                href="#"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Parolanızı mı unuttunuz?
              </a>
            </div>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="px-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-input accent-primary"
            />
            Beni hatırla
          </label>

          <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={loading}>
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
