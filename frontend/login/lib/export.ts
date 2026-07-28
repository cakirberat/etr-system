import { columns, type DataRow } from "./data"
import type { ProcessedRow } from "./pipeline"

export type ExportFormat = "csv" | "json" | "xlsx"

type ExportRow = Record<string, string | number | boolean>

const exportColumns = columns.filter((c) => c.key !== "__issues")

function toExportRows(rows: ProcessedRow[]): ExportRow[] {
  return rows.map((row) => {
    const out: ExportRow = {}
    for (const col of exportColumns) {
      if (col.key in row) out[col.key] = row[col.key as keyof DataRow] as string | number
    }
    if (row.__flagged) out["isaretli"] = true
    if (row.__atamalar?.length) out["atamalar"] = row.__atamalar.map((a) => a.label).join("; ")
    return out
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")
}

export function exportToCsv(rows: ProcessedRow[], filename?: string) {
  const data = toExportRows(rows)
  const headers = [...exportColumns.map((c) => c.key), ...(rows.some((r) => r.__flagged) ? ["isaretli"] : []), ...(rows.some((r) => r.__atamalar?.length) ? ["atamalar"] : [])]
  const uniqueHeaders = [...new Set(headers)]

  const escape = (v: unknown) => {
    const s = String(v ?? "")
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const lines = [
    uniqueHeaders.join(","),
    ...data.map((row) => uniqueHeaders.map((h) => escape(row[h])).join(",")),
  ]

  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" })
  downloadBlob(blob, filename ?? `ako_veri_${timestamp()}.csv`)
}

export function exportToJson(rows: ProcessedRow[], filename?: string) {
  const data = toExportRows(rows)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" })
  downloadBlob(blob, filename ?? `ako_veri_${timestamp()}.json`)
}

export async function exportToXlsx(rows: ProcessedRow[], filename?: string) {
  const XLSX = await import("xlsx")
  const data = toExportRows(rows)
  const sheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Veri")
  XLSX.writeFile(workbook, filename ?? `ako_veri_${timestamp()}.xlsx`)
}

export async function exportData(rows: ProcessedRow[], format: ExportFormat, filename?: string) {
  switch (format) {
    case "csv":
      exportToCsv(rows, filename)
      break
    case "json":
      exportToJson(rows, filename)
      break
    case "xlsx":
      await exportToXlsx(rows, filename)
      break
  }
}

export function filterRowsBySearch(rows: ProcessedRow[], query: string): ProcessedRow[] {
  const q = query.trim().toLocaleLowerCase("tr-TR")
  if (!q) return rows

  return rows.filter((row) =>
    Object.entries(row).some(([key, value]) => {
      if (key.startsWith("__")) return false
      return String(value).toLocaleLowerCase("tr-TR").includes(q)
    }),
  )
}
