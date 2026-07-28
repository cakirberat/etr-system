import type { DataRow } from "./data"

const ADS = [
  "Ayşe", "Mehmet", "Zeynep", "Ali", "Fatma", "Burak", "Elif", "Hasan", "Selin", "Emre",
  "Deniz", "Gül", "Cem", "Merve", "Okan", "Can", "Leyla", "Serkan", "Aslı", "Tunç",
  "Ece", "Kaan", "Naz", "Barış", "Dilara", "Furkan", "Hale", "İrem", "Jale", "Koray",
]

const SOYADS = [
  "Yılmaz", "Demir", "Kaya", "Çelik", "Arslan", "Öztürk", "Şahin", "Koç", "Aydın", "Polat",
  "Aksoy", "Erdoğan", "Yıldız", "Güneş", "Tekin", "Korkmaz", "Mutlu", "Ergin", "Yavuz", "Tan",
]

const DEPARTMANLAR = [
  "İnsan Kaynakları", "Üretim", "Finans", "IT", "Satış", "Pazarlama", "Lojistik", "Yönetim",
  "it", "BILGI ISLEM", "finans dept", "???", "Üretim ", "  Satış", "", "insan kaynakları",
]

const DURUMLAR = [
  "Aktif", "Pasif", "İzinli", "aktif", "AKTIF", "pasif", "bilinmiyor", "", "Aktif ", "İZİNLİ",
]

const KATEGORILER = ["", "", "", "A", "B", "C", "VIP", "???", "eski", "—"]

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function detectIssues(row: DataRow): string[] {
  const issues: string[] = []
  if (!row.ad?.trim() || row.ad === "???") issues.push("eksik_ad")
  if (!row.soyad?.trim()) issues.push("eksik_soyad")
  if (row.yas <= 0 || row.yas > 120) issues.push("gecersiz_yas")
  if (row.maas <= 0) issues.push("gecersiz_maas")
  if (!row.departman?.trim() || row.departman === "???") issues.push("bozuk_departman")
  if (!row.durum?.trim() || row.durum === "bilinmiyor" || row.durum === "???") issues.push("bozuk_durum")
  if (!row.iseGiris?.trim() || row.iseGiris.includes("99") || row.iseGiris.includes("00/00")) issues.push("bozuk_tarih")
  return issues
}

export function generateMessyData(count = 500, seed = 42): DataRow[] {
  const random = rng(seed)
  const list: DataRow[] = []

  for (let i = 1; i <= count; i++) {
    const corrupt = Math.floor(random() * 100)
    const ad = corrupt < 8 ? "" : corrupt < 12 ? "???" : ADS[Math.floor(random() * ADS.length)]
    const soyad = corrupt < 6 ? "" : SOYADS[Math.floor(random() * SOYADS.length)]
    const yas = corrupt < 10 ? 0 : corrupt < 14 ? Math.floor(random() * 800) + 150 : Math.floor(random() * 43) + 22
    const maas = corrupt < 12 ? 0 : corrupt < 16 ? Math.floor(random() * 5000) + 1 : Math.floor(random() * 70000) + 28000
    const departman = DEPARTMANLAR[Math.floor(random() * DEPARTMANLAR.length)]
    const durum = DURUMLAR[Math.floor(random() * DURUMLAR.length)] as DataRow["durum"]
    const kategori = KATEGORILER[Math.floor(random() * KATEGORILER.length)]
    const iseGiris =
      corrupt < 15
        ? (["", "00/00/0000", "2019-99-99"] as const)[Math.floor(random() * 3)]
        : `${1995 + Math.floor(random() * 29)}-${String(Math.floor(random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(random() * 28) + 1).padStart(2, "0")}`

    const row: DataRow = {
      id: i,
      ad: corrupt < 5 ? ad.toUpperCase() : ad,
      soyad,
      yas,
      departman,
      maas,
      durum,
      iseGiris,
      kategori,
    }
    list.push(row)
  }

  return list
}

export const issueLabels: Record<string, string> = {
  eksik_ad: "Eksik ad",
  eksik_soyad: "Eksik soyad",
  gecersiz_yas: "Geçersiz yaş",
  gecersiz_maas: "Geçersiz maaş",
  bozuk_departman: "Bozuk departman",
  bozuk_durum: "Bozuk durum",
  bozuk_tarih: "Bozuk tarih",
}
