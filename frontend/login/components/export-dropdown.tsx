"use client"

import { useEffect, useRef, useState } from "react"
import { Download, ChevronDown, FileSpreadsheet, FileJson, FileText } from "lucide-react"
import { exportData, type ExportFormat } from "@/lib/export"
import type { ProcessedRow } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

type Props = {
  rows: ProcessedRow[]
  onExport?: (format: ExportFormat) => void
  className?: string
}

const formats: { id: ExportFormat; label: string; icon: typeof FileText; ext: string }[] = [
  { id: "csv", label: "CSV", icon: FileText, ext: ".csv" },
  { id: "json", label: "JSON", icon: FileJson, ext: ".json" },
  { id: "xlsx", label: "Excel (XLSX)", icon: FileSpreadsheet, ext: ".xlsx" },
]

export function ExportDropdown({ rows, onExport, className }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleExport(format: ExportFormat) {
    if (rows.length === 0) return
    setLoading(format)
    try {
      await exportData(rows, format)
      onExport?.(format)
      setOpen(false)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={rows.length === 0}
        className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Dışa Aktar</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Format seçin
          </div>
          {formats.map(({ id, label, icon: Icon, ext }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleExport(id)}
              disabled={loading !== null}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="flex-1 text-left font-medium">{label}</span>
              <span className="text-[10px] text-muted-foreground">{ext}</span>
              {loading === id && <span className="text-[10px] text-muted-foreground">…</span>}
            </button>
          ))}
          <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
            {rows.length.toLocaleString("tr-TR")} kayıt dışa aktarılacak
          </div>
        </div>
      )}
    </div>
  )
}
