import { Database, Search, Bell } from "lucide-react"
import { AkoLogo } from "./ako-logo"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <AkoLogo />
          <div className="hidden h-8 w-px bg-border md:block" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Ana menü">
            {["Veri Kümesi", "Kural Motoru", "Raporlar"].map((item, i) => (
              <button
                key={item}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Kayıt ara…"
              className="h-9 w-44 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-56"
              aria-label="Kayıt ara"
            />
          </div>
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            aria-label="Bildirimler"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background py-1 pl-1 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              MK
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-xs font-semibold">Murat Kaya</div>
              <div className="text-[10px] text-muted-foreground">Veri Analisti</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground sm:px-6">
        <Database className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium text-foreground">personel_veritabani.csv</span>
        <span>· Kurumsal Veri İşleme Konsolu</span>
      </div>
    </header>
  )
}
