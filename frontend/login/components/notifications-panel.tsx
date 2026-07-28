"use client"

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { Bell, CheckCircle2, Upload, Download, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationItem = {
  id: string
  type: "upload" | "export" | "rule" | "info"
  message: string
  time: Date
}

type Props = {
  items: NotificationItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onClear: () => void
}

const iconMap = {
  upload: Upload,
  export: Download,
  rule: Filter,
  info: CheckCircle2,
}

export function NotificationsPanel({ items, open, onOpenChange, onClear }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false)
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, onOpenChange])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
        aria-label="Bildirimler"
      >
        <Bell className="h-4 w-4" />
        {items.length > 0 && (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <span className="text-sm font-semibold">Bildirimler</span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Temizle
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">Henüz bildirim yok</p>
            ) : (
              items.map((item) => {
                const Icon = iconMap[item.type]
                return (
                  <div key={item.id} className="flex gap-2.5 border-b border-border/60 px-3 py-2.5 last:border-0">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed">{item.message}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {item.time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function addNotification(
  setter: Dispatch<SetStateAction<NotificationItem[]>>,
  type: NotificationItem["type"],
  message: string,
) {
  setter((prev) => [
    { id: crypto.randomUUID(), type, message, time: new Date() },
    ...prev.slice(0, 19),
  ])
}
