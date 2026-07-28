"use client"

import { useMemo, useState } from "react"
import { generateData } from "@/lib/data"
import { applyPipeline, type Rule } from "@/lib/pipeline"
import { PipelinePanel } from "./pipeline-panel"
import { DataTable } from "./data-table"

const baseData = generateData()

const initialRules: Rule[] = [
  { id: "r1", field: "yas", operator: ">", value: "60", action: "sil", enabled: true },
  { id: "r2", field: "durum", operator: "=", value: "Aktif", action: "işaretle", enabled: true },
]

export function Dashboard() {
  const [rules, setRules] = useState<Rule[]>(initialRules)

  const result = useMemo(() => applyPipeline(baseData, rules), [rules])

  const stats = {
    total: baseData.length,
    removed: result.removed,
    flagged: result.flagged,
    remaining: result.rows.length,
  }

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 p-4 sm:px-6 lg:grid-cols-[320px_1fr]">
      <div className="lg:sticky lg:top-[92px] lg:h-[calc(100vh-108px)]">
        <PipelinePanel
          rules={rules}
          onAdd={(rule) => setRules((r) => [...r, rule])}
          onUpdate={(id, patch) => setRules((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)))}
          onRemove={(id) => setRules((r) => r.filter((x) => x.id !== id))}
          onClear={() => setRules([])}
          stats={stats}
        />
      </div>
      <div className="min-w-0 lg:h-[calc(100vh-108px)]">
        <DataTable rows={result.rows} />
      </div>
    </div>
  )
}
