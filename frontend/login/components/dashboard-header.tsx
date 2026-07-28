"use client"

import { useRouter } from "next/navigation"
import { Database, Search, LogOut, Upload } from "lucide-react"
import { AkoLogo } from "./ako-logo"
import { ThemeToggle } from "./theme-toggle"
import { NotificationsPanel, type NotificationItem } from "./notifications-panel"
import { logout } from "@/lib/api"
import { cn } from "@/lib/utils"

export type DashboardTab = "dataset" | "pipeline" | "reports"

const tabs: { id: DashboardTab; label: string }[] = [
  { id: "dataset", label: "Veri Kümesi" },
  { id: "pipeline", label: "Kural Motoru" },
  { id: "reports", label: "Raporlar" },
]

type Props = {
  username?: string
  datasetName?: string
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onUploadClick?: () => void
  notifications: NotificationItem[]
  notificationsOpen: boolean
  onNotificationsOpenChange: (open: boolean) => void
  onClearNotifications: () => void
}

export function DashboardHeader({
  username = "Admin",
  datasetName = "personel_veritabani.csv",
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onUploadClick,
  notifications,
  notificationsOpen,
  onNotificationsOpenChange,
  onClearNotifications,
}: Props) {
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push("/")
  }

  const initials = username.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <AkoLogo />
          <div className="hidden h-8 w-px bg-border md:block" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Ana menü">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {onUploadClick && (
            <button
              type="button"
              onClick={onUploadClick}
              className="hidden h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-secondary sm:flex"
            >
              <Upload className="h-4 w-4" />
              Veri Yükle
            </button>
          )}
          {activeTab === "dataset" && (
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Kayıt ara…"
                className="h-9 w-44 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-56"
                aria-label="Kayıt ara"
              />
            </div>
          )}
          <ThemeToggle />
          <NotificationsPanel
            items={notifications}
            open={notificationsOpen}
            onOpenChange={onNotificationsOpenChange}
            onClear={onClearNotifications}
          />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
            aria-label="Çıkış yap"
            title="Çıkış yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background py-1 pl-1 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-xs font-semibold">{username}</div>
              <div className="text-[10px] text-muted-foreground">Veri Analisti</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil sekme menüsü */}
      <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden" aria-label="Mobil menü">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground sm:px-6">
        <Database className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium text-foreground">{datasetName}</span>
        <span>· Kurumsal Veri İşleme Konsolu</span>
      </div>
    </header>
  )
}
