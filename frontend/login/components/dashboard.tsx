"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { generateData, rowsFromApi } from "@/lib/data"
import { applyPipeline, type Rule, type ProcessedRow } from "@/lib/pipeline"
import { filterRowsBySearch, type ExportFormat } from "@/lib/export"
import { applyPipelineApi, fetchDataset, uploadFile } from "@/lib/api"
import { PipelinePanel } from "./pipeline-panel"
import { DataTable } from "./data-table"
import { ReportsPanel } from "./reports-panel"
import { addNotification, type NotificationItem } from "./notifications-panel"
import type { DashboardTab } from "./dashboard-header"

const initialRules: Rule[] = [
  {
    id: "r1",
    conditions: [{ field: "yas", operator: ">", value: "120" }],
    action: "sil",
    enabled: true,
  },
  {
    id: "r2",
    conditions: [{ field: "ad", operator: "dolu", value: "" }],
    action: "dönüştür",
    targetField: "ad",
    transformOp: "baş_harf",
    label: "Ad düzenle",
    enabled: true,
  },
  {
    id: "r3",
    conditions: [{ field: "durum", operator: "dolu", value: "" }],
    action: "dönüştür",
    targetField: "durum",
    transformOp: "durum_düzelt",
    label: "Durum normalize",
    enabled: true,
  },
  {
    id: "r4",
    conditions: [{ field: "maas", operator: "=", value: "0" }],
    action: "ata",
    targetField: "kategori",
    assignValue: "Düzeltilecek",
    label: "Düzeltilecek",
    enabled: true,
  },
  {
    id: "r5",
    conditions: [
      { field: "durum", operator: "içerir", value: "aktif" },
      { field: "maas", operator: ">", value: "70000" },
    ],
    action: "ata",
    targetField: "kategori",
    assignValue: "A",
    label: "VIP Grubu A",
    enabled: true,
  },
]

type Props = {
  activeTab: DashboardTab
  searchQuery: string
  uploadTrigger?: number
  onNotify: React.Dispatch<React.SetStateAction<NotificationItem[]>>
}

function rulesForApi(rules: Rule[]) {
  return rules.map((r) => ({
    id: r.id,
    field: r.conditions[0]?.field ?? "",
    operator: r.conditions[0]?.operator ?? "=",
    value: r.conditions[0]?.value ?? "",
    action: r.action,
    enabled: r.enabled,
    conditions: r.conditions,
    targetField: r.targetField,
    assignValue: r.assignValue,
    transformOp: r.transformOp,
    label: r.label,
  }))
}

export function Dashboard({ activeTab, searchQuery, uploadTrigger, onNotify }: Props) {
  const [baseData, setBaseData] = useState(generateData())
  const [rules, setRules] = useState<Rule[]>(initialRules)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kategoriFilter, setKategoriFilter] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const records = await fetchDataset()
      if (records.length > 0) setBaseData(rowsFromApi(records))
    } catch {
      setBaseData(generateData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (uploadTrigger && uploadTrigger > 0) fileInputRef.current?.click()
  }, [uploadTrigger])

  const result = useMemo(() => applyPipeline(baseData, rules), [baseData, rules])

  const filteredRows = useMemo(
    () => filterRowsBySearch(result.rows as ProcessedRow[], searchQuery),
    [result.rows, searchQuery],
  )

  const kategoriBuckets = useMemo(() => {
    const counts: Record<string, number> = {}
    result.rows.forEach((r) => {
      const k = r.kategori?.trim() || "(boş)"
      counts[k] = (counts[k] ?? 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [result.rows])

  const stats = {
    total: baseData.length,
    removed: result.removed,
    flagged: result.flagged,
    assigned: result.assigned,
    transformed: result.transformed,
    remaining: result.rows.length,
  }

  async function handleRulesChange(nextRules: Rule[]) {
    setRules(nextRules)
    addNotification(onNotify, "rule", `${nextRules.length} kural aktif`)
    try {
      await applyPipelineApi(rulesForApi(nextRules))
    } catch { /* offline */ }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const res = await uploadFile(file)
      addNotification(onNotify, "upload", res.message)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme hatası")
    } finally {
      event.target.value = ""
    }
  }

  function handleExport(format: ExportFormat) {
    const labels = { csv: "CSV", json: "JSON", xlsx: "Excel" }
    addNotification(onNotify, "export", `${filteredRows.length} kayıt ${labels[format]} olarak indirildi`)
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        500 kayıtlık veri havuzu yükleniyor…
      </div>
    )
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
      {error && (
        <div className="mx-4 mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive sm:mx-6">{error}</div>
      )}

      {activeTab === "dataset" && (
        <div className="grid flex-1 grid-cols-1 gap-4 p-4 sm:px-6 lg:grid-cols-[340px_1fr] lg:items-stretch">
          <div className="flex min-h-0 flex-col gap-3 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-130px)]">
            <div className="min-h-0 flex-1">
              <PipelinePanel
                className="h-full"
                rules={rules}
                onAdd={(rule) => handleRulesChange([...rules, rule])}
                onUpdate={(id, patch) => handleRulesChange(rules.map((x) => (x.id === id ? { ...x, ...patch } : x)))}
                onRemove={(id) => handleRulesChange(rules.filter((x) => x.id !== id))}
                onClear={() => handleRulesChange([])}
                stats={stats}
              />
            </div>
            {kategoriBuckets.length > 0 && (
              <div className="shrink-0 rounded-xl border border-border bg-card p-3 shadow-sm">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Kategori filtresi</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setKategoriFilter("")}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${!kategoriFilter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                  >
                    Tümü
                  </button>
                  {kategoriBuckets.slice(0, 10).map(([k, n]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKategoriFilter(k === "(boş)" ? "" : k)}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${kategoriFilter === k ? "bg-emerald-600 text-white" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"}`}
                    >
                      {k} ({n})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="min-h-[480px] min-w-0 lg:h-[calc(100vh-130px)]">
            <DataTable rows={filteredRows} searchQuery={searchQuery} kategoriFilter={kategoriFilter} onExport={handleExport} />
          </div>
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="grid flex-1 grid-cols-1 gap-4 p-4 sm:px-6 lg:grid-cols-[1fr_400px] lg:items-stretch">
          <div className="min-h-0 min-w-0 lg:h-[calc(100vh-130px)]">
            <PipelinePanel
              className="h-full"
              rules={rules}
              onAdd={(rule) => handleRulesChange([...rules, rule])}
              onUpdate={(id, patch) => handleRulesChange(rules.map((x) => (x.id === id ? { ...x, ...patch } : x)))}
              onRemove={(id) => handleRulesChange(rules.filter((x) => x.id !== id))}
              onClear={() => handleRulesChange([])}
              stats={stats}
              expanded
            />
          </div>
          <div className="min-h-[400px] min-w-0 lg:h-[calc(100vh-130px)]">
            <DataTable rows={filteredRows} compact onExport={handleExport} />
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <ReportsPanel
          rows={result.rows as ProcessedRow[]}
          baseTotal={baseData.length}
          rules={rules}
          stats={stats}
          kategoriBuckets={kategoriBuckets}
          onExport={handleExport}
        />
      )}
    </>
  )
}
