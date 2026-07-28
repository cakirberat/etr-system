"use client"

import { useMemo, useState } from "react"
import { ArrowUp, ArrowDown, ChevronsUpDown, ChevronLeft, ChevronRight, Flag, Tag, AlertTriangle, Wand2 } from "lucide-react"
import { columns, detectIssues } from "@/lib/data"
import { issueLabels } from "@/lib/messy-data"
import type { ProcessedRow } from "@/lib/pipeline"
import type { ExportFormat } from "@/lib/export"
import { ExportDropdown } from "./export-dropdown"
import { cn } from "@/lib/utils"

type SortDir = "asc" | "desc"

const PAGE_SIZES = [10, 25, 50, 100]

function statusClass(durum: string) {
  const d = durum.trim().toLocaleLowerCase("tr-TR")
  if (d === "aktif") return "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
  if (d === "pasif") return "bg-muted text-muted-foreground ring-1 ring-inset ring-border"
  if (d.includes("izin")) return "bg-accent text-accent-foreground ring-1 ring-inset ring-accent-foreground/20"
  return "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20"
}

function formatCell(row: ProcessedRow, key: string, type: string) {
  const v = row[key as keyof ProcessedRow]
  if (v === undefined || v === null || v === "") return "—"
  if (key === "maas") return Number(v).toLocaleString("tr-TR")
  if (type === "date") {
    const d = new Date(String(v))
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("tr-TR")
  }
  return String(v)
}

function isAssignedField(row: ProcessedRow, field: string) {
  return row.__atamalar?.some((a) => a.field === field)
}

export function DataTable({
  rows,
  searchQuery,
  compact,
  onExport,
  kategoriFilter,
}: {
  rows: ProcessedRow[]
  searchQuery?: string
  compact?: boolean
  onExport?: (format: ExportFormat) => void
  kategoriFilter?: string
}) {
  const [sortKey, setSortKey] = useState<string>("id")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const filtered = useMemo(() => {
    if (!kategoriFilter?.trim()) return rows
    const q = kategoriFilter.trim().toLocaleLowerCase("tr-TR")
    return rows.filter((r) => r.kategori.toLocaleLowerCase("tr-TR") === q)
  }, [rows, kategoriFilter])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = a[sortKey as keyof ProcessedRow]
      const bv = b[sortKey as keyof ProcessedRow]
      let cmp: number
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv
      else cmp = String(av ?? "").localeCompare(String(bv ?? ""), "tr")
      return sortDir === "asc" ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pageRows = sorted.slice(start, start + pageSize)

  const assignmentBuckets = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((r) => {
      if (r.kategori?.trim()) set.add(r.kategori.trim())
      r.__atamalar?.forEach((a) => set.add(a.label))
    })
    return [...set].sort()
  }, [rows])

  function toggleSort(key: string) {
    if (key === "__issues") return
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">{compact ? "Canlı Önizleme" : "Veri Önizleme"}</h2>
          <p className="text-[11px] text-muted-foreground">
            {sorted.length.toLocaleString("tr-TR")} kayıt
            {searchQuery?.trim() ? ` · "${searchQuery}"` : ""}
            {kategoriFilter ? ` · Kategori: ${kategoriFilter}` : ""}
          </p>
          {assignmentBuckets.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {assignmentBuckets.slice(0, 8).map((b) => (
                <span key={b} className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  <Tag className="h-2.5 w-2.5" /> {b}
                </span>
              ))}
            </div>
          )}
        </div>
        <ExportDropdown rows={sorted} onExport={onExport} />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-secondary/80 backdrop-blur">
            <tr>
              <th className="w-10 border-b border-border px-2 py-2.5" />
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "border-b border-border px-3 py-2.5 font-semibold text-muted-foreground",
                    col.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {col.key !== "__issues" ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                        col.align === "right" && "flex-row-reverse",
                        sortKey === col.key && "text-foreground",
                      )}
                    >
                      <span className="whitespace-nowrap text-xs uppercase tracking-wide">{col.label}</span>
                      {sortKey === col.key ? (
                        sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    <span className="text-xs uppercase tracking-wide">{col.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const issues = row.__bozuk ?? detectIssues(row)
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/60 transition-colors hover:bg-secondary/50",
                    row.__flagged && "bg-accent/30",
                    row.__assigned && "bg-emerald-500/5",
                  row.__transformed && !row.__assigned && "bg-violet-500/5",
                  )}
                >
                  <td className="px-2 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      {row.__flagged && <Flag className="h-3 w-3 text-primary" aria-label="İşaretli" />}
                      {row.__assigned && <Tag className="h-3 w-3 text-emerald-600" aria-label="Atandı" />}
                      {row.__transformed && <Wand2 className="h-3 w-3 text-violet-600" aria-label="Dönüştürüldü" />}
                    </div>
                  </td>
                  {columns.map((col) => {
                    if (col.type === "issues") {
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          {issues.length === 0 ? (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-0.5">
                              {issues.slice(0, 2).map((iss) => (
                                <span key={iss} className="inline-flex items-center gap-0.5 rounded bg-destructive/10 px-1 py-0.5 text-[9px] text-destructive" title={issueLabels[iss] ?? iss}>
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                  {issueLabels[iss] ?? iss}
                                </span>
                              ))}
                              {issues.length > 2 && <span className="text-[9px] text-muted-foreground">+{issues.length - 2}</span>}
                            </div>
                          )}
                        </td>
                      )
                    }
                    if (col.type === "status") {
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusClass(row.durum))}>
                            {row.durum || "—"}
                          </span>
                        </td>
                      )
                    }
                    if (col.type === "kategori") {
                      const assigned = isAssignedField(row, "kategori")
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                              assigned
                                ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-400"
                                : row.kategori
                                  ? "bg-secondary text-secondary-foreground"
                                  : "text-muted-foreground",
                            )}
                            title={row.__atamalar?.map((a) => `${a.field}=${a.value}`).join(", ")}
                          >
                            {assigned && <Tag className="h-3 w-3" />}
                            {row.kategori || "—"}
                          </span>
                        </td>
                      )
                    }
                    const isEmpty = !row[col.key as keyof ProcessedRow] && row[col.key as keyof ProcessedRow] !== 0
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "whitespace-nowrap px-3 py-2.5",
                          col.align === "right" ? "text-right font-mono tabular-nums" : "text-left",
                          col.key === "ad" ? "font-medium text-foreground" : "text-muted-foreground",
                          isEmpty && "text-destructive/60 italic",
                          isAssignedField(row, col.key) && "bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400",
                          row.__atamalar?.some((a) => a.field === col.key && a.label.includes("Harf")) && "bg-violet-500/10 font-semibold text-violet-700 dark:text-violet-400",
                        )}
                      >
                        {formatCell(row, col.key, col.type)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-16 text-center text-sm text-muted-foreground">
                  Gösterilecek kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Sayfa başına</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="hidden sm:inline">
            {sorted.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, sorted.length)} / {sorted.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium hover:bg-secondary disabled:opacity-40">
            <ChevronLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Önceki</span>
          </button>
          <span className="px-2 text-xs text-muted-foreground">{currentPage} / {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium hover:bg-secondary disabled:opacity-40">
            <span className="hidden sm:inline">Sonraki</span><ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
