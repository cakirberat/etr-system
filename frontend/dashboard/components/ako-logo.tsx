import { cn } from "@/lib/utils"

export function AkoLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3 3 21h4l1.6-3.4h6.8L17 21h4L12 3Zm-1.9 11 1.9-4.2L13.9 14h-3.8Z" fill="currentColor" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="text-sm font-bold tracking-tight">
          AKO <span className="text-primary">GRUP</span>
        </div>
        <div className="text-[11px] font-medium text-muted-foreground">Veri Yönetimi</div>
      </div>
    </div>
  )
}
