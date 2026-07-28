export type DataRow = {
  id: number
  ad: string
  soyad: string
  yas: number
  departman: string
  maas: number
  durum: "Aktif" | "Pasif" | "İzinli"
  iseGiris: string
}

export type ColumnDef = {
  key: keyof DataRow
  label: string
  type: "number" | "text" | "status" | "date"
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
  { key: "iseGiris", label: "İşe Giriş", type: "date" },
]

export const filterableFields = [
  { key: "yas", label: "Yaş", type: "number" as const },
  { key: "maas", label: "Maaş", type: "number" as const },
  { key: "departman", label: "Departman", type: "text" as const },
  { key: "durum", label: "Durum", type: "text" as const },
  { key: "ad", label: "Ad", type: "text" as const },
  { key: "soyad", label: "Soyad", type: "text" as const },
]

const seed: Omit<DataRow, "id">[] = [
  { ad: "Ayşe", soyad: "Yılmaz", yas: 34, departman: "İnsan Kaynakları", maas: 42000, durum: "Aktif", iseGiris: "2019-03-15" },
  { ad: "Mehmet", soyad: "Demir", yas: 58, departman: "Üretim", maas: 38500, durum: "Aktif", iseGiris: "2008-11-02" },
  { ad: "Zeynep", soyad: "Kaya", yas: 29, departman: "Finans", maas: 51000, durum: "İzinli", iseGiris: "2021-07-20" },
  { ad: "Ali", soyad: "Çelik", yas: 45, departman: "IT", maas: 62000, durum: "Aktif", iseGiris: "2015-01-10" },
  { ad: "Fatma", soyad: "Arslan", yas: 63, departman: "Üretim", maas: 36000, durum: "Pasif", iseGiris: "2001-05-28" },
  { ad: "Burak", soyad: "Öztürk", yas: 31, departman: "Satış", maas: 48000, durum: "Aktif", iseGiris: "2020-09-01" },
  { ad: "Elif", soyad: "Şahin", yas: 27, departman: "Pazarlama", maas: 44000, durum: "Aktif", iseGiris: "2022-02-14" },
  { ad: "Hasan", soyad: "Koç", yas: 52, departman: "Lojistik", maas: 41000, durum: "Aktif", iseGiris: "2010-08-22" },
  { ad: "Selin", soyad: "Aydın", yas: 38, departman: "Finans", maas: 55000, durum: "Aktif", iseGiris: "2017-04-05" },
  { ad: "Emre", soyad: "Polat", yas: 66, departman: "Yönetim", maas: 95000, durum: "Pasif", iseGiris: "1998-12-01" },
  { ad: "Deniz", soyad: "Aksoy", yas: 33, departman: "IT", maas: 58000, durum: "Aktif", iseGiris: "2018-06-18" },
  { ad: "Gül", soyad: "Erdoğan", yas: 41, departman: "İnsan Kaynakları", maas: 46000, durum: "İzinli", iseGiris: "2014-10-30" },
  { ad: "Cem", soyad: "Yıldız", yas: 24, departman: "Satış", maas: 35000, durum: "Aktif", iseGiris: "2023-01-09" },
  { ad: "Merve", soyad: "Güneş", yas: 36, departman: "Pazarlama", maas: 49500, durum: "Aktif", iseGiris: "2016-11-25" },
  { ad: "Okan", soyad: "Tekin", yas: 55, departman: "Üretim", maas: 40000, durum: "Aktif", iseGiris: "2009-07-14" },
]

export function generateData(): DataRow[] {
  return seed.map((row, index) => ({ id: index + 1, ...row }))
}
