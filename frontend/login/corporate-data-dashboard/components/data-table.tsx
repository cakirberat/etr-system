"use client"

import { useMemo, useState } from "react"
import { ArrowUp, ArrowDown, ChevronsUpDown, ChevronLeft, ChevronRight, Flag, Download } from "lucide-react"
import { columns, type DataRow } from "@/lib/data"
import type { ProcessedRow } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

type SortDir = "asc" | "desc"

const statusStyles: Record<DataRow["durum"], string> = {
  Aktif: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
  Pasif: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  İzinli: "bg-accent text-accent-foreground ring-1 ring-inset ring-accent-foreground/20",
}

const PAGE_SIZES = [10, 25, 50]

function formatCell(row: ProcessedRow, key: string, type: string) {
  const v = row[key as keyof ProcessedRow]
  if (key === "maas") return Number(v).toLocaleString("tr-TR")
  if (type === "date") return new Date(String(v)).toLocaleDateString("tr-TR")
  return String(v)
}

export function DataTable({ rows }: { rows: ProcessedRow[] }) {
  const [sortKey, setSortKey] = useState<string>("id")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortKey as keyof ProcessedRow]
      const bv = b[sortKey as keyof ProcessedRow]
      let cmp: number
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv
      else cmp = String(av).localeCompare(String(bv), "tr")
      return sortDir === "asc" ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pageRows = sorted.slice(start, start + pageSize)

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Veri Önizleme</h2>
          <p className="text-[11px] text-muted-foreground">
            İşlem hattı uygulandıktan sonraki sonuç · {sorted.length.toLocaleString("tr-TR")} kayıt
          </p>
        </div>
        <button className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Dışa Aktar</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-secondary/80 backdrop-blur">
            <tr>
              <th className="w-8 border-b border-border px-3 py-2.5" />
              {columns.map((col) => {
                const active = sortKey === col.key
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "border-b border-border px-3 py-2.5 font-semibold text-muted-foreground",
                      col.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    <button
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                        col.align === "right" && "flex-row-reverse",
                        active && "text-foreground",
                      )}
                    >
                      <span className="whitespace-nowrap text-xs uppercase tracking-wide">{col.label}</span>
                      {active ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-primary" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/60 transition-colors hover:bg-secondary/50",
                  row.__flagged && "bg-accent/40",
                )}
              >
                <td className="px-3 py-2.5 text-center">
                  {row.__flagged && <Flag className="mx-auto h-3.5 w-3.5 text-primary" aria-label="İşaretli" />}
                </td>
                {columns.map((col) => {
                  if (col.type === "status") {
                    return (
                      <td key={col.key} className="px-3 py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            statusStyles[row.durum],
                          )}
                        >
                          {row.durum}
                        </span>
                      </td>
                    )
                  }
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap px-3 py-2.5",
                        col.align === "right" ? "text-right font-mono tabular-nums" : "text-left",
                        col.key === "ad" ? "font-medium text-foreground" : "text-muted-foreground",
                        col.key === "id" && "text-muted-foreground",
                      )}
                    >
                      {formatCell(row, col.key, col.type)}
                    </td>
                  )
                })}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-16 text-center text-sm text-muted-foreground">
                  Kural filtreleri tüm satırları eledi. Bir adımı kaldırmayı deneyin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Sayfa başına</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            aria-label="Sayfa boyutu"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="hidden sm:inline">
            {sorted.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, sorted.length)} / {sorted.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Önceki</span>
          </button>
          <div className="flex items-center gap-1 px-1">
            {getPageNumbers(currentPage, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="px-1 text-xs text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                    p === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background hover:bg-secondary",
                  )}
                >
                  {p}
                </button>
              ),
            )}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Sonraki</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "…")[] = [1]
  const from = Math.max(2, current - 1)
  const to = Math.min(total - 1, current + 1)
  if (from > 2) pages.push("…")
  for (let i = from; i <= to; i++) pages.push(i)
  if (to < total - 1) pages.push("…")
  pages.push(total)
  return pages
}
