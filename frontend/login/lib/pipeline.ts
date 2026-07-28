import type { DataRow } from "./data"
import { detectIssues } from "./data"

export type Operator = ">" | "<" | ">=" | "<=" | "=" | "!=" | "içerir" | "başlar" | "biter" | "boş" | "dolu"
export type Action = "sil" | "tut" | "işaretle" | "ata" | "dönüştür"

export type TransformOp =
  | "büyük_harf"
  | "küçük_harf"
  | "trim"
  | "baş_harf"
  | "durum_düzelt"
  | "temizle"

export type RuleCondition = {
  field: string
  operator: Operator
  value: string
}

export type AssignmentLog = {
  ruleId: string
  field: string
  value: string
  label: string
}

export type Rule = {
  id: string
  conditions: RuleCondition[]
  action: Action
  targetField?: string
  assignValue?: string
  transformOp?: TransformOp
  label?: string
  enabled: boolean
}

export type ProcessedRow = DataRow & {
  __flagged?: boolean
  __assigned?: boolean
  __transformed?: boolean
  __atamalar?: AssignmentLog[]
  __bozuk?: string[]
}

export const numericOperators: Operator[] = [">", "<", ">=", "<=", "=", "!="]
export const textOperators: Operator[] = ["=", "!=", "içerir", "başlar", "biter", "boş", "dolu"]

export const actionLabels: Record<Action, string> = {
  sil: "Eşleşeni sil",
  tut: "Eşleşeni tut",
  işaretle: "Eşleşeni işaretle",
  ata: "Değer ata",
  dönüştür: "Dönüştür",
}

export const transformLabels: Record<TransformOp, string> = {
  büyük_harf: "BÜYÜK HARF",
  küçük_harf: "küçük harf",
  trim: "Boşluk temizle",
  baş_harf: "Baş Harf Büyük",
  durum_düzelt: "Durumu düzelt (Aktif/Pasif/İzinli)",
  temizle: "Alanı temizle",
}

function getFieldValue(row: DataRow, field: string): string | number {
  const value = row[field as keyof DataRow]
  if (typeof value === "number") return value
  return String(value ?? "")
}

function isEmpty(value: string | number, field: string): boolean {
  if (field === "maas" || field === "yas") {
    return Number(value) === 0
  }
  return !String(value ?? "").trim() || String(value).trim() === "—"
}

function matchesCondition(row: DataRow, condition: RuleCondition): boolean {
  const raw = getFieldValue(row, condition.field)
  const textFields = new Set(["ad", "soyad", "departman", "durum", "kategori", "iseGiris"])
  const isNumeric = !textFields.has(condition.field) && typeof raw === "number"

  if (condition.operator === "boş") return isEmpty(raw, condition.field)
  if (condition.operator === "dolu") return !isEmpty(raw, condition.field)

  const fieldValue = isNumeric ? raw : String(raw).trim().toLocaleLowerCase("tr-TR")
  const compareValue = isNumeric ? Number(condition.value) : condition.value.trim().toLocaleLowerCase("tr-TR")

  if (isNumeric && Number.isNaN(compareValue as number)) return false

  switch (condition.operator) {
    case ">":
      return (fieldValue as number) > (compareValue as number)
    case "<":
      return (fieldValue as number) < (compareValue as number)
    case ">=":
      return (fieldValue as number) >= (compareValue as number)
    case "<=":
      return (fieldValue as number) <= (compareValue as number)
    case "=":
      return fieldValue === compareValue
    case "!=":
      return fieldValue !== compareValue
    case "içerir":
      return String(fieldValue).includes(String(compareValue))
    case "başlar":
      return String(fieldValue).startsWith(String(compareValue))
    case "biter":
      return String(fieldValue).endsWith(String(compareValue))
    default:
      return false
  }
}

function matchesAll(row: DataRow, rule: Rule): boolean {
  if (rule.conditions.length === 0) return true
  return rule.conditions.every((c) => {
    if (c.operator === "boş" || c.operator === "dolu") return matchesCondition(row, c)
    if (!c.value.trim() && c.operator !== "boş") return true
    return matchesCondition(row, c)
  })
}

function coerceAssignValue(field: string, value: string): string | number {
  if (field === "yas") return Number(value) || 0
  if (field === "maas") return Number(value) || 0
  return value
}

function applyTransform(value: string, op: TransformOp): string {
  const v = value ?? ""
  switch (op) {
    case "büyük_harf":
      return v.toLocaleUpperCase("tr-TR")
    case "küçük_harf":
      return v.toLocaleLowerCase("tr-TR")
    case "trim":
      return v.trim().replace(/\s+/g, " ")
    case "baş_harf":
      return v
        .trim()
        .toLocaleLowerCase("tr-TR")
        .split(/\s+/)
        .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
        .join(" ")
    case "durum_düzelt": {
      const d = v.trim().toLocaleLowerCase("tr-TR")
      if (d.includes("aktif")) return "Aktif"
      if (d.includes("pasif")) return "Pasif"
      if (d.includes("izin")) return "İzinli"
      return "Aktif"
    }
    case "temizle":
      return ""
    default:
      return v
  }
}

function describeAction(rule: Rule): string {
  if (rule.action === "ata" && rule.targetField && rule.assignValue != null) {
    return `${rule.targetField} = ${rule.assignValue}${rule.label ? ` (${rule.label})` : ""}`
  }
  if (rule.action === "dönüştür" && rule.targetField && rule.transformOp) {
    return `${rule.targetField} → ${transformLabels[rule.transformOp]}`
  }
  return actionLabels[rule.action]
}

export function applyPipeline(data: DataRow[], rules: Rule[]) {
  let rows: ProcessedRow[] = data.map((row) => ({
    ...row,
    __bozuk: detectIssues(row),
  }))
  let removed = 0
  let flagged = 0
  let assigned = 0
  let transformed = 0

  for (const rule of rules.filter((r) => r.enabled)) {
    const next: ProcessedRow[] = []

    for (const row of rows) {
      const hit = matchesAll(row, rule)

      if (rule.action === "sil") {
        if (hit) { removed += 1; continue }
        next.push(row)
        continue
      }

      if (rule.action === "tut") {
        if (hit) next.push(row)
        else removed += 1
        continue
      }

      if (rule.action === "işaretle") {
        if (hit) {
          flagged += 1
          next.push({ ...row, __flagged: true })
        } else next.push(row)
        continue
      }

      if (rule.action === "ata" && rule.targetField && rule.assignValue != null) {
        if (hit) {
          assigned += 1
          const target = rule.targetField as keyof DataRow
          const value = coerceAssignValue(rule.targetField, rule.assignValue)
          const log: AssignmentLog = {
            ruleId: rule.id,
            field: rule.targetField,
            value: rule.assignValue,
            label: rule.label ?? rule.assignValue,
          }
          next.push({
            ...row,
            [target]: value,
            __assigned: true,
            __atamalar: [...(row.__atamalar ?? []), log],
          })
        } else next.push(row)
        continue
      }

      if (rule.action === "dönüştür" && rule.targetField && rule.transformOp) {
        if (hit) {
          transformed += 1
          const target = rule.targetField as keyof DataRow
          const current = String(row[target] ?? "")
          const newVal = applyTransform(current, rule.transformOp)
          const log: AssignmentLog = {
            ruleId: rule.id,
            field: rule.targetField,
            value: newVal,
            label: rule.label ?? transformLabels[rule.transformOp],
          }
          next.push({
            ...row,
            [target]: rule.targetField === "yas" || rule.targetField === "maas"
              ? Number(newVal) || 0
              : newVal,
            __transformed: true,
            __atamalar: [...(row.__atamalar ?? []), log],
          })
        } else next.push(row)
        continue
      }

      next.push(row)
    }

    rows = next
  }

  return { rows, removed, flagged, assigned, transformed, remaining: rows.length }
}

export { describeAction }

export function formatRuleSummary(rule: Rule): string {
  const cond = rule.conditions
    .map((c) => (c.operator === "boş" || c.operator === "dolu" ? `${c.field} ${c.operator}` : `${c.field} ${c.operator} ${c.value}`))
    .join(" VE ")
  return `${cond || "tüm kayıtlar"} → ${describeAction(rule)}`
}
