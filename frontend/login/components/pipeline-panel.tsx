"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical, Filter, Zap, X, ArrowRight, Link2, Wand2 } from "lucide-react"
import { filterableFields, assignableFields } from "@/lib/data"
import {
  type Rule,
  type RuleCondition,
  type Operator,
  type Action,
  type TransformOp,
  numericOperators,
  textOperators,
  actionLabels,
  transformLabels,
  describeAction,
} from "@/lib/pipeline"
import { cn } from "@/lib/utils"

type Props = {
  rules: Rule[]
  onAdd: (rule: Rule) => void
  onUpdate: (id: string, patch: Partial<Rule>) => void
  onRemove: (id: string) => void
  onClear: () => void
  stats: { total: number; removed: number; flagged: number; assigned: number; transformed: number; remaining: number }
  expanded?: boolean
  className?: string
}

const actionStyles: Record<Action, string> = {
  sil: "bg-destructive/10 text-destructive",
  tut: "bg-primary/10 text-primary",
  işaretle: "bg-accent text-accent-foreground",
  ata: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  dönüştür: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
}

const filterActions: Action[] = ["sil", "tut", "işaretle"]
const editActions: Action[] = ["ata", "dönüştür"]

const emptyCondition = (): RuleCondition => ({
  field: filterableFields[0].key,
  operator: "=",
  value: "",
})

export function PipelinePanel({ rules, onAdd, onUpdate, onRemove, onClear, stats, expanded, className }: Props) {
  const [conditions, setConditions] = useState<RuleCondition[]>([emptyCondition()])
  const [action, setAction] = useState<Action>("dönüştür")
  const [targetField, setTargetField] = useState("ad")
  const [assignValue, setAssignValue] = useState("")
  const [transformOp, setTransformOp] = useState<TransformOp>("büyük_harf")
  const [label, setLabel] = useState("")

  function updateCondition(index: number, patch: Partial<RuleCondition>) {
    setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  function addCondition() {
    setConditions((prev) => [...prev, emptyCondition()])
  }

  function removeCondition(index: number) {
    if (conditions.length <= 1) return
    setConditions((prev) => prev.filter((_, i) => i !== index))
  }

  function handleAdd() {
    const valid = conditions.filter(
      (c) => c.operator === "boş" || c.operator === "dolu" || c.value.trim(),
    )
    if (valid.length === 0) return
    if (action === "ata" && !assignValue.trim()) return
    if (action === "dönüştür" && !targetField) return

    onAdd({
      id: crypto.randomUUID(),
      conditions: valid,
      action,
      targetField: action === "ata" || action === "dönüştür" ? targetField : undefined,
      assignValue: action === "ata" ? assignValue.trim() : undefined,
      transformOp: action === "dönüştür" ? transformOp : undefined,
      label: label.trim() || undefined,
      enabled: true,
    })

    setConditions([emptyCondition()])
    setAssignValue("")
    setLabel("")
  }

  const needsValue = conditions.some((c) => c.operator !== "boş" && c.operator !== "dolu")
  const canAdd =
    conditions.some((c) => c.operator === "boş" || c.operator === "dolu" || c.value.trim()) &&
    (!needsValue || conditions.some((c) => c.value.trim() || c.operator === "boş" || c.operator === "dolu")) &&
    (action === "dönüştür" || action !== "ata" || assignValue.trim())

  return (
    <aside
      className={cn(
        "flex min-h-[560px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        expanded ? "h-full max-h-[calc(100vh-120px)]" : "h-full max-h-[calc(100vh-120px)]",
        className,
      )}
    >
      {/* Başlık */}
      <div className="shrink-0 border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-none">İşlem Hattı</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {expanded ? "Koşul + dönüştürme + atama kuralları" : "Koşullar VE ile birleşir, sırayla uygulanır"}
            </p>
          </div>
        </div>
      </div>

      {/* Yeni kural formu — kaydırılabilir */}
      <div className="shrink-0 max-h-[45vh] overflow-y-auto border-b border-border bg-secondary/40 p-4">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Yeni Kural
        </label>
        <div className="space-y-2">
          {conditions.map((cond, index) => {
            const fieldMeta = filterableFields.find((f) => f.key === cond.field)!
            const ops = fieldMeta.type === "number" ? numericOperators : textOperators
            const noValue = cond.operator === "boş" || cond.operator === "dolu"
            return (
              <div key={index}>
                {index > 0 && (
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <Link2 className="h-3 w-3" /> VE
                  </div>
                )}
                <div className="flex gap-1.5">
                  <select
                    value={cond.field}
                    onChange={(e) => {
                      const f = filterableFields.find((x) => x.key === e.target.value)!
                      updateCondition(index, { field: e.target.value, operator: f.type === "number" ? ">" : "=" })
                    }}
                    className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none"
                  >
                    {filterableFields.map((f) => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as Operator })}
                    className="h-9 w-[4.5rem] shrink-0 rounded-md border border-input bg-background px-1 text-xs outline-none"
                  >
                    {ops.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  {!noValue && (
                    <input
                      value={cond.value}
                      onChange={(e) => updateCondition(index, { value: e.target.value })}
                      placeholder={fieldMeta.type === "number" ? "50000" : "değer"}
                      className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none"
                    />
                  )}
                  {conditions.length > 1 && (
                    <button type="button" onClick={() => removeCondition(index)} className="flex h-9 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          <button type="button" onClick={addCondition} className="flex h-8 w-full items-center justify-center gap-1 rounded-md border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
            <Plus className="h-3.5 w-3.5" /> Koşul ekle (VE)
          </button>

          <div>
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">Filtre eylemleri</span>
            <div className="grid grid-cols-3 gap-1 rounded-md bg-background p-1">
              {filterActions.map((a) => (
                <ActionBtn key={a} action={a} current={action} onSelect={setAction} />
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">Düzenleme eylemleri</span>
            <div className="grid grid-cols-2 gap-1 rounded-md bg-background p-1">
              {editActions.map((a) => (
                <ActionBtn key={a} action={a} current={action} onSelect={setAction} icon={a === "dönüştür" ? Wand2 : undefined} />
              ))}
            </div>
          </div>

          {action === "ata" && (
            <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Eşleşen kayda sabit değer ata</p>
              <div className="flex gap-2">
                <select value={targetField} onChange={(e) => setTargetField(e.target.value)} className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none">
                  {assignableFields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
                <span className="flex items-center text-xs">=</span>
                <input value={assignValue} onChange={(e) => setAssignValue(e.target.value)} placeholder="A, VIP…" className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none" />
              </div>
            </div>
          )}

          {action === "dönüştür" && (
            <div className="space-y-2 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
              <p className="text-[11px] font-medium text-violet-700 dark:text-violet-400">Eşleşen kaydın alanını dönüştür</p>
              <select value={targetField} onChange={(e) => setTargetField(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs outline-none">
                {assignableFields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
              <select value={transformOp} onChange={(e) => setTransformOp(e.target.value as TransformOp)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs outline-none">
                {(Object.keys(transformLabels) as TransformOp[]).map((op) => (
                  <option key={op} value={op}>{transformLabels[op]}</option>
                ))}
              </select>
            </div>
          )}

          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Etiket (opsiyonel)" className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none" />

          <button type="button" onClick={handleAdd} disabled={!canAdd} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Plus className="h-4 w-4" /> Adım Ekle
          </button>
        </div>
      </div>

      {/* Adımlar başlığı */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Adımlar ({rules.length})
        </span>
        {rules.length > 0 && (
          <button type="button" onClick={onClear} className="text-[11px] font-medium text-muted-foreground hover:text-destructive">
            Tümünü temizle
          </button>
        )}
      </div>

      {/* Adımlar listesi — her zaman görünür alan */}
      <div className="min-h-[140px] flex-1 overflow-y-auto px-3 py-2">
        {rules.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 text-center">
            <Zap className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">
              Örnek: ad içerir mehmet → ad BÜYÜK HARF
            </p>
          </div>
        ) : (
          <ol className="space-y-2 pb-2">
            {rules.map((rule, i) => (
              <li key={rule.id} className={cn("rounded-lg border border-border bg-background p-2.5 shadow-sm", !rule.enabled && "opacity-50")}>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="space-y-0.5 text-xs">
                      {rule.conditions.map((c, ci) => {
                        const fl = filterableFields.find((f) => f.key === c.field)?.label ?? c.field
                        return (
                          <div key={ci} className="flex flex-wrap items-center gap-1">
                            {ci > 0 && <span className="font-bold text-primary">VE</span>}
                            <span className="font-semibold">{fl}</span>
                            <span className="rounded bg-secondary px-1 font-mono">{c.operator}</span>
                            {c.operator !== "boş" && c.operator !== "dolu" && (
                              <span className="font-mono">{c.value}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", actionStyles[rule.action])}>
                        {describeAction(rule)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button type="button" onClick={() => onUpdate(rule.id, { enabled: !rule.enabled })} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary">
                      {rule.enabled ? <X className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => onRemove(rule.id)} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* İstatistikler */}
      <div className="shrink-0 border-t border-border bg-secondary/40 p-3">
        <div className="grid grid-cols-5 gap-1 text-center">
          <Stat label="Toplam" value={stats.total} tone="muted" />
          <Stat label="Silinen" value={stats.removed} tone="danger" />
          <Stat label="Atanan" value={stats.assigned} tone="success" />
          <Stat label="Dönüşt." value={stats.transformed} tone="violet" />
          <Stat label="Kalan" value={stats.remaining} tone="primary" />
        </div>
      </div>
    </aside>
  )
}

function ActionBtn({ action, current, onSelect, icon: Icon }: { action: Action; current: Action; onSelect: (a: Action) => void; icon?: typeof Wand2 }) {
  const labels: Record<Action, string> = { sil: "Sil", tut: "Tut", işaretle: "İşaretle", ata: "Değer Ata", dönüştür: "Dönüştür" }
  return (
    <button
      type="button"
      onClick={() => onSelect(action)}
      className={cn(
        "flex items-center justify-center gap-1 rounded px-2 py-1.5 text-[11px] font-medium transition-colors",
        current === action ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {labels[action]}
    </button>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "muted" | "danger" | "primary" | "success" | "violet" }) {
  const color =
    tone === "danger" ? "text-destructive"
    : tone === "primary" ? "text-primary"
    : tone === "success" ? "text-emerald-600 dark:text-emerald-400"
    : tone === "violet" ? "text-violet-600 dark:text-violet-400"
    : "text-foreground"
  return (
    <div className="rounded-md bg-background px-0.5 py-1.5">
      <div className={cn("font-mono text-xs font-bold tabular-nums", color)}>{value}</div>
      <div className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
