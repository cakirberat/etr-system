import type { DataRow } from "./data"

export type Operator = ">" | "<" | ">=" | "<=" | "=" | "!=" | "içerir" | "başlar" | "biter"
export type Action = "sil" | "tut" | "işaretle"

export type Rule = {
  id: string
  field: string
  operator: Operator
  value: string
  action: Action
  enabled: boolean
}

export type ProcessedRow = DataRow & { __flagged?: boolean }

export const numericOperators: Operator[] = [">", "<", ">=", "<=", "=", "!="]
export const textOperators: Operator[] = ["=", "!=", "içerir", "başlar", "biter"]

export const actionLabels: Record<Action, string> = {
  sil: "Eşleşeni sil",
  tut: "Eşleşeni tut",
  işaretle: "Eşleşeni işaretle",
}

function getFieldValue(row: DataRow, field: string): string | number {
  const value = row[field as keyof DataRow]
  if (typeof value === "number") return value
  return String(value ?? "")
}

function matches(row: DataRow, rule: Rule): boolean {
  const raw = getFieldValue(row, rule.field)
  const isNumeric = typeof raw === "number"
  const fieldValue = isNumeric ? raw : String(raw).toLocaleLowerCase("tr-TR")
  const compareValue = isNumeric ? Number(rule.value) : rule.value.toLocaleLowerCase("tr-TR")

  if (isNumeric && Number.isNaN(compareValue as number)) return false

  switch (rule.operator) {
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

export function applyPipeline(data: DataRow[], rules: Rule[]) {
  let rows: ProcessedRow[] = data.map((row) => ({ ...row }))
  let removed = 0
  let flagged = 0

  for (const rule of rules.filter((r) => r.enabled)) {
    const next: ProcessedRow[] = []

    for (const row of rows) {
      const hit = matches(row, rule)

      if (rule.action === "sil") {
        if (hit) {
          removed += 1
          continue
        }
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
        } else {
          next.push(row)
        }
      }
    }

    rows = next
  }

  return { rows, removed, flagged, remaining: rows.length }
}
