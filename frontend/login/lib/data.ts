import { detectIssues, generateMessyData } from "./messy-data"

export type DataRow = {
  id: number
  ad: string
  soyad: string
  yas: number
  departman: string
  maas: number
  durum: string
  iseGiris: string
  kategori: string
}

export type ColumnDef = {
  key: keyof DataRow | "__issues"
  label: string
  type: "number" | "text" | "status" | "date" | "kategori" | "issues"
  align?: "left" | "right"
}

export const columns: ColumnDef[] = [
  { key: "id", label: "ID", type: "number" },
  { key: "ad", label: "Ad", type: "text" },
  { key: "soyad", label: "Soyad", type: "text" },
  { key: "yas", label: "Yaş", type: "number", align: "right" },
  { key: "departman", label: "Departman", type: "text" },
  { key: "maas", label: "Maaş (₺)", type: "number", align: "right" },
  { key: "durum", label: "Durum", type: "status" },
  { key: "kategori", label: "Kategori", type: "kategori" },
  { key: "iseGiris", label: "İşe Giriş", type: "date" },
  { key: "__issues", label: "Sorunlar", type: "issues" },
]

export const filterableFields = [
  { key: "ad", label: "Ad", type: "text" as const },
  { key: "soyad", label: "Soyad", type: "text" as const },
  { key: "yas", label: "Yaş", type: "number" as const },
  { key: "maas", label: "Maaş", type: "number" as const },
  { key: "departman", label: "Departman", type: "text" as const },
  { key: "durum", label: "Durum", type: "text" as const },
  { key: "kategori", label: "Kategori", type: "text" as const },
  { key: "iseGiris", label: "İşe Giriş", type: "text" as const },
]

export const assignableFields = [
  { key: "kategori", label: "Kategori" },
  { key: "departman", label: "Departman" },
  { key: "durum", label: "Durum" },
  { key: "ad", label: "Ad" },
  { key: "soyad", label: "Soyad" },
]

export function generateData(): DataRow[] {
  return generateMessyData(500)
}

export function rowsFromApi(records: Record<string, unknown>[]): DataRow[] {
  return records.map((record, index) => {
    const row: DataRow = {
      id: Number(record.id ?? index + 1),
      ad: String(record.ad ?? record.Ad ?? ""),
      soyad: String(record.soyad ?? record.Soyad ?? ""),
      yas: Number(record.yas ?? record.Yas ?? 0),
      departman: String(record.departman ?? record.Departman ?? ""),
      maas: Number(record.maas ?? record.Maas ?? 0),
      durum: String(record.durum ?? record.Durum ?? ""),
      iseGiris: String(record.iseGiris ?? record.IseGiris ?? ""),
      kategori: String(record.kategori ?? record.Kategori ?? ""),
    }
    return row
  })
}

export { detectIssues }
