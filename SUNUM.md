# AKO GRUP · Kurumsal Veri İşleme Platformu
## Proje Sunum Metni

**Ekip:** 6 kişi · **Teknoloji:** Next.js + .NET Core 8 + SQLite + JWT  
**Sunum süresi önerisi:** 15–20 dakika + demo

---

## 1. Açılış (1–2 dk)

> *"Sayın yöneticilerimiz ve değerli dinleyiciler,*
>
> *Staj sürecimizde geliştirdiğimiz **AKO GRUP Kurumsal Veri İşleme Platformu**'nu sizlere sunmaktan memnuniyet duyuyoruz.*
>
> *Bu proje, kurumsal ortamlarda sık karşılaşılan üç temel ihtiyacı tek bir çatı altında birleştirir:*
> - *Güvenli kullanıcı girişi*
> - *Çok formatlı veri yükleme*
> - *Koşullu, sıralı veri işleme (pipeline)*
>
> *Platform; modern bir arayüz, güvenli bir API katmanı ve esnek bir kural motoru ile tasarlanmıştır."*

---

## 2. Problem Tanımı (2 dk)

> *"Kurumsal veri setleri genellikle farklı kaynaklardan gelir: Excel raporları, CSV dışa aktarımları, REST API'lerden gelen JSON yanıtları…*
>
> *Bu veriler çoğu zaman:*
> - *Tutarsız sütun adlarına sahiptir*
> - *Eksik veya hatalı kayıtlar içerir*
> - *İş kurallarına göre filtrelenmesi gerekir*
>
> *Mevcut süreçlerde bu işlemler manuel yapıldığında hem zaman kaybı hem de insan hatası riski artar.*
>
> *Bizim hedefimiz: **ham veriyi yükleyip, tanımlanan kurallarla otomatik işleyip, sonucu anlık görmek**."*

---

## 3. Proje Mimarisi (3 dk)

> *"Projemiz üç ana katmandan oluşur:"*

### Katman 1 — Frontend (Next.js)
- Kurumsal giriş ekranı ve veri yönetim konsolu
- Aydınlık / karanlık tema desteği
- Responsive, erişilebilir arayüz (AKO GRUP kurumsal kimliği)

### Katman 2 — Backend API (.NET Core 8)
- JWT tabanlı kimlik doğrulama
- RESTful API uç noktaları
- Swagger ile API dokümantasyonu

### Katman 3 — Veri Katmanı (SQLite)
- Hafif, taşınabilir veritabanı
- Kullanıcı ve personel kayıtları
- Geliştirme ve demo ortamı için ideal

```
┌─────────────────┐     JWT      ┌──────────────────┐     EF Core    ┌──────────┐
│  Next.js UI     │ ────────────▶│  .NET Core API   │ ─────────────▶│  SQLite  │
│  (Port 3000)    │◀────────────│  (Port 5030)     │◀──────────────│  DB      │
└─────────────────┘   JSON/REST  └──────────────────┘                └──────────┘
```

> *"Frontend ve backend birbirinden bağımsız geliştirilebilir; bu sayede ekip paralel çalışabilir ve ileride mobil veya farklı istemciler eklenebilir."*

---

## 4. Modül 1 — Arayüz Tasarımı (2 dk)

> *"İlk modülümüz kurumsal arayüz tasarımıdır."*

**Özellikler:**
- Giriş sayfası: kullanıcı adı / parola, form doğrulama, hata mesajları
- Dashboard: veri tablosu, kural paneli, istatistik kartları
- Üst menü: veri yükleme, oturum kapatma, tema değiştirme
- Durum rozetleri: Aktif / Pasif / İzinli personel görselleştirmesi

> *"Tasarım kararlarımız: sade tipografi, mavi kurumsal vurgu rengi, yüksek kontrastlı tablolar ve mobil uyumlu grid yapısı."*

**Demo adımı:** Giriş ekranını göster → tema değiştir → dashboard'a geç.

---

## 5. Modül 2 — JWT ile Kimlik Doğrulama (2–3 dk)

> *"İkinci modülümüz güvenli oturum yönetimidir."*

**Akış:**
1. Kullanıcı `admin` / `ako2026` ile giriş yapar
2. Backend parolayı BCrypt ile doğrular
3. Geçerli oturum için JWT token üretilir (8 saat geçerlilik)
4. Sonraki tüm API isteklerinde `Authorization: Bearer {token}` header'ı kullanılır
5. Token olmadan veri uç noktalarına erişim reddedilir (401)

**Güvenlik tercihleri:**
| Konu | Çözüm |
|------|-------|
| Parola saklama | BCrypt hash |
| Oturum | Stateless JWT |
| CORS | Sadece localhost:3000 |
| API dokümantasyonu | Swagger UI |

> *"Bu yaklaşım, kurumsal uygulamalarda yaygın kullanılan industry-standard bir modeldir."*

**Demo adımı:** Yanlış parola dene → hata mesajı → doğru giriş → Swagger'da Bearer token ile `/api/data` çağrısı.

---

## 6. Modül 3 — Veri Yükleme ve Kural Motoru (4–5 dk)

> *"Üçüncü ve en kapsamlı modülümüz: veri yükleme ve koşullu işleme hattı."*

### 6.1 Veri Yükleme

**Desteklenen yöntemler:**

| Yöntem | Format | Açıklama |
|--------|--------|----------|
| Dosya yükleme | CSV, JSON, XLSX | Form-data ile multipart upload |
| POST body | JSON array | REST API üzerinden doğrudan veri gönderimi |

**Esnek alan eşleme:** Sütun adları farklı yazılsa bile sistem tanır:
- `ad` / `Ad` / `name` / `Name`
- `yas` / `Yas` / `age`
- `maas` / `Maas` / `salary`

> *"Bozuk veya karışık veri setlerinde sütun adları standart olmasa bile import servisimiz normalize ederek kayıt oluşturur."*

### 6.2 Kural Motoru (Pipeline)

Kurallar **sırayla** uygulanır. Her kural şunları tanımlar:

- **Alan:** yaş, maaş, departman, durum…
- **Operatör:** `>`, `<`, `=`, `!=`, `içerir`, `başlar`, `biter`
- **Değer:** karşılaştırılacak eşik
- **Eylem:**
  - **Sil** — eşleşen kaydı çıkar
  - **Tut** — sadece eşleşenleri bırak
  - **İşaretle** — eşleşenleri vurgula

**Örnek senaryo:**
1. `yaş > 60` → **Sil** → Emekli adayları listeden çıkar
2. `durum = Aktif` → **İşaretle** → Aktif personeli vurgula

> *"Kurallar anlık olarak tabloya yansır; toplam, silinen ve kalan kayıt sayıları panelde gösterilir."*

**Demo adımı:**
1. Örnek CSV yükle
2. Kural ekle → tabloda değişimi göster
3. İkinci kural ekle → sıralı etkiyi göster

---

## 7. Ekip İş Dağılımı (6 Kişi)

| Kişi | Sorumluluk | Çıktılar |
|------|------------|----------|
| **1 — Frontend Lead** | Next.js proje yapısı, layout, routing | Giriş + dashboard sayfaları |
| **2 — UI/UX** | Bileşen tasarımı, tema, responsive | Tablo, panel, header, logo |
| **3 — Backend Lead** | .NET Core API, Program.cs, middleware | Proje iskeleti, CORS, Swagger |
| **4 — Auth & Security** | JWT, BCrypt, AuthController | Login endpoint, token doğrulama |
| **5 — Data & Import** | SQLite, import servisi, upload | CSV/JSON/XLSX parser, seed data |
| **6 — Pipeline & QA** | Kural motoru, test, entegrasyon | Pipeline API, demo senaryoları, sunum |

**Haftalık plan (öneri):**

| Hafta | Hedef |
|-------|-------|
| 1 | Mimari karar, repo kurulumu, wireframe |
| 2 | Frontend UI + Backend iskelet (paralel) |
| 3 | JWT login + API entegrasyonu |
| 4 | Upload + pipeline + test + sunum |

---

## 8. Teknik Özellikler Özeti

| Bileşen | Teknoloji |
|---------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | ASP.NET Core 8, Entity Framework Core |
| Veritabanı | SQLite |
| Kimlik doğrulama | JWT Bearer + BCrypt |
| Excel okuma | ClosedXML |
| API dokümantasyonu | Swagger / OpenAPI |

---

## 9. Canlı Demo Senaryosu (5 dk)

1. **Backend başlat** → `http://localhost:5030/swagger`
2. **Frontend başlat** → `http://localhost:3000`
3. Giriş: `admin` / `ako2026`
4. Karanlık temaya geç
5. Dashboard'da mevcut 15 personel kaydını göster
6. **Veri Yükle** → `ornek_veri.csv` yükle
7. Kural ekle: `Yaş > 55` → Sil
8. Kural ekle: `Durum = Aktif` → İşaretle
9. İstatistikleri oku: toplam / silinen / kalan
10. Çıkış yap → korumalı sayfaya erişilemediğini göster

---

## 10. Gelecek Geliştirmeler

- Rol tabanlı yetkilendirme (Admin / Analisti / Görüntüleyici)
- Kural şablonlarını kaydetme ve paylaşma
- İşlem geçmişi (audit log)
- PostgreSQL / SQL Server'a geçiş (production)
- Docker ile tek komutla deploy
- Rapor export (PDF / Excel)

---

## 11. Kapanış (1 dk)

> *"Özetle; AKO GRUP Kurumsal Veri İşleme Platformu, modern web teknolojileri ile güvenli, esnek ve kullanıcı dostu bir veri yönetim çözümü sunmaktadır.*
>
> *Üç modül — arayüz, kimlik doğrulama ve veri işleme hattı — birlikte çalışarak kurumsal veri operasyonlarını hızlandırır.*
>
> *Sorularınız için teşekkür ederiz."*

---

## Ek: Sunum Slayt Başlık Önerileri

1. Kapak — AKO GRUP Veri Platformu
2. Problem & Hedef
3. Mimari Diyagram
4. Modül 1 — Arayüz
5. Modül 2 — JWT Güvenlik
6. Modül 3 — Upload & Pipeline
7. Ekip & İş Dağılımı
8. Canlı Demo
9. Yol Haritası
10. Teşekkürler & Sorular
