"use client"

import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Users,
  Trash2,
  Flag,
  Filter,
} from "lucide-react"
import { Tag } from "lucide-react"
import { filterableFields } from "@/lib/data"
import { actionLabels, describeAction, type Rule, type ProcessedRow } from "@/lib/pipeline"
import { exportData, type ExportFormat } from "@/lib/export"
import { cn } from "@/lib/utils"

type Props = {
  rows: ProcessedRow[]
  baseTotal: number
  rules: Rule[]
  stats: { total: number; removed: number; flagged: number; assigned: number; transformed: number; remaining: number }
  kategoriBuckets?: [string, number][]
  onExport?: (format: ExportFormat) => void
}

export function ReportsPanel({ rows, baseTotal, rules, stats, kategoriBuckets = [], onExport }: Props) {
  const deptCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.departman] = (acc[row.departman] ?? 0) + 1
    return acc
  }, {})

  const statusCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.durum] = (acc[row.durum] ?? 0) + 1
    return acc
  }, {})

  const avgMaas = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.maas, 0) / rows.length)
    : 0

  const maxDept = Math.max(...Object.values(deptCounts), 1)

  async function handleExport(format: ExportFormat) {
    if (rows.length === 0) return
    await exportData(rows, format)
    onExport?.(format)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Raporlar & Dışa Aktarma</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kural motoru uygulandıktan sonraki temizlenmiş veri özeti ve indirme seçenekleri
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton icon={FileText} label="CSV" onClick={() => handleExport("csv")} disabled={rows.length === 0} />
          <ExportButton icon={FileJson} label="JSON" onClick={() => handleExport("json")} disabled={rows.length === 0} />
          <ExportButton icon={FileSpreadsheet} label="XLSX" onClick={() => handleExport("xlsx")} disabled={rows.length === 0} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Ham kayıt" value={baseTotal} tone="muted" />
        <StatCard icon={Trash2} label="Silinen" value={stats.removed} tone="danger" />
        <StatCard icon={Flag} label="İşaretli" value={stats.flagged} tone="accent" />
        <StatCard icon={Tag} label="Atanan" value={stats.assigned} tone="success" />
        <StatCard icon={BarChart3} label="Dönüştürülen" value={stats.transformed} tone="violet" />
        <StatCard icon={BarChart3} label="Kalan" value={stats.remaining} tone="primary" />
      </div>

      {kategoriBuckets.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Kategori atamaları (A, B, VIP…)</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {kategoriBuckets.map(([k, n]) => (
              <span key={k} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <Tag className="h-3.5 w-3.5" /> {k}: {n}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Departman dağılımı</h3>
          <div className="mt-4 space-y-2.5">
            {Object.entries(deptCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([dept, count]) => (
                <div key={dept}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{dept}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(count / maxDept) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            {Object.keys(deptCounts).length === 0 && (
              <p className="text-xs text-muted-foreground">Gösterilecek kayıt yok</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Durum özeti</h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(["Aktif", "Pasif", "İzinli"] as const).map((status) => (
              <div key={status} className="rounded-lg border border-border bg-background p-3 text-center">
                <div className="font-mono text-xl font-bold tabular-nums">{statusCounts[status] ?? 0}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{status}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Ortalama maaş: </span>
            <span className="font-semibold">{avgMaas.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Uygulanan kurallar ({rules.filter((r) => r.enabled).length})</h3>
        </div>
        {rules.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Henüz kural tanımlanmadı.</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {rules.map((rule, i) => (
                <li
                  key={rule.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm",
                    !rule.enabled && "opacity-50",
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="flex-1 space-y-0.5">
                    {rule.conditions.map((c, ci) => {
                      const fl = filterableFields.find((f) => f.key === c.field)?.label ?? c.field
                      return (
                        <span key={ci} className="block">
                          {ci > 0 && <span className="mr-1 font-bold text-primary">VE </span>}
                          <span className="font-medium">{fl}</span>{" "}
                          <span className="font-mono text-xs">{c.operator}</span>{" "}
                          {c.operator !== "boş" && c.operator !== "dolu" && (
                            <span className="font-mono">{c.value}</span>
                          )}
                        </span>
                      )
                    })}
                    <span className="block text-xs text-muted-foreground">
                      → {describeAction(rule)}
                    </span>
                  </span>
                </li>
              ))}
          </ol>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-center">
        <Download className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-2 text-sm font-medium">Temizlenmiş veriyi indirin</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {stats.remaining} kayıt · CSV, JSON veya Excel formatında
        </p>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users
  label: string
  value: number
  tone: "muted" | "danger" | "accent" | "primary" | "success" | "violet"
}) {
  const colors = {
    muted: "text-foreground",
    danger: "text-destructive",
    accent: "text-accent-foreground",
    primary: "text-primary",
    success: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={cn("mt-2 font-mono text-2xl font-bold tabular-nums", colors[tone])}>
        {value.toLocaleString("tr-TR")}
      </div>
    </div>
  )
}

function ExportButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof FileText
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </button>
  )
}
