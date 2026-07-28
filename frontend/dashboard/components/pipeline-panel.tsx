"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical, Filter, Zap, X, ArrowRight } from "lucide-react"
import { filterableFields } from "@/lib/data"
import {
  type Rule,
  type Operator,
  type Action,
  numericOperators,
  textOperators,
  actionLabels,
} from "@/lib/pipeline"
import { cn } from "@/lib/utils"

type Props = {
  rules: Rule[]
  onAdd: (rule: Rule) => void
  onUpdate: (id: string, patch: Partial<Rule>) => void
  onRemove: (id: string) => void
  onClear: () => void
  stats: { total: number; removed: number; flagged: number; remaining: number }
}

const actionStyles: Record<Action, string> = {
  sil: "bg-destructive/10 text-destructive",
  tut: "bg-primary/10 text-primary",
  işaretle: "bg-accent text-accent-foreground",
}

export function PipelinePanel({ rules, onAdd, onUpdate, onRemove, onClear, stats }: Props) {
  const [field, setField] = useState(filterableFields[0].key)
  const [operator, setOperator] = useState<Operator>(">")
  const [value, setValue] = useState("")
  const [action, setAction] = useState<Action>("sil")

  const selectedField = filterableFields.find((f) => f.key === field)!
  const operators = selectedField.type === "number" ? numericOperators : textOperators

  function handleAdd() {
    if (!value.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      field,
      operator: operators.includes(operator) ? operator : operators[0],
      value: value.trim(),
      action,
      enabled: true,
    })
    setValue("")
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-none">İşlem Hattı</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">Kurallar sırayla uygulanır</p>
          </div>
        </div>
      </div>

      {/* Kural oluşturucu */}
      <div className="border-b border-border bg-secondary/40 p-4">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Yeni Kural
        </label>
        <div className="space-y-2">
          <select
            value={field}
            onChange={(e) => {
              setField(e.target.value)
              const t = filterableFields.find((f) => f.key === e.target.value)!.type
              setOperator(t === "number" ? ">" : "içerir")
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            aria-label="Alan"
          >
            {filterableFields.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as Operator)}
              className="h-9 w-24 shrink-0 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              aria-label="Operatör"
            >
              {operators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) handleAdd()
              }}
              placeholder={selectedField.type === "number" ? "Değer, örn. 60" : "Metin"}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              aria-label="Değer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">Eylem</span>
            <div className="flex flex-1 gap-1 rounded-md bg-background p-1">
              {(Object.keys(actionLabels) as Action[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={cn(
                    "flex-1 rounded px-1.5 py-1 text-[11px] font-medium transition-colors",
                    action === a
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {a === "sil" ? "Sil" : a === "tut" ? "Tut" : "İşaretle"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!value.trim()}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Adım Ekle
          </button>
        </div>
      </div>

      {/* Kural listesi */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Adımlar ({rules.length})
        </span>
        {rules.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            Tümünü temizle
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {rules.length === 0 ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 text-center">
            <Zap className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">
              Henüz kural yok. Verinizi filtrelemek için yukarıdan adım ekleyin.
            </p>
          </div>
        ) : (
          <ol className="space-y-2">
            {rules.map((rule, i) => {
              const label = filterableFields.find((f) => f.key === rule.field)?.label ?? rule.field
              return (
                <li
                  key={rule.id}
                  className={cn(
                    "group relative rounded-lg border border-border bg-card p-2.5 shadow-sm transition-opacity",
                    !rule.enabled && "opacity-50",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-semibold">{label}</span>
                        <span className="rounded bg-secondary px-1 font-mono text-xs text-secondary-foreground">
                          {rule.operator}
                        </span>
                        <span className="truncate font-mono text-xs text-foreground">{rule.value}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowRight className="h-3 w-3" />
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[11px] font-medium",
                            actionStyles[rule.action],
                          )}
                        >
                          {actionLabels[rule.action]}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        onClick={() => onUpdate(rule.id, { enabled: !rule.enabled })}
                        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label={rule.enabled ? "Devre dışı bırak" : "Etkinleştir"}
                        title={rule.enabled ? "Devre dışı bırak" : "Etkinleştir"}
                      >
                        {rule.enabled ? <X className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => onRemove(rule.id)}
                        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted-foreground/40" />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {/* Özet */}
      <div className="border-t border-border bg-secondary/40 p-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Toplam" value={stats.total} tone="muted" />
          <Stat label="Silinen" value={stats.removed} tone="danger" />
          <Stat label="Kalan" value={stats.remaining} tone="primary" />
        </div>
      </div>
    </aside>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "muted" | "danger" | "primary" }) {
  const color =
    tone === "danger" ? "text-destructive" : tone === "primary" ? "text-primary" : "text-foreground"
  return (
    <div className="rounded-md bg-background px-1 py-2">
      <div className={cn("font-mono text-base font-bold tabular-nums", color)}>{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
