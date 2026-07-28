# AKO GRUP · Kurumsal Veri İşleme Platformu

Next.js frontend + .NET Core 8 backend + SQLite + JWT kimlik doğrulama.

## Gereksinimler

- **Node.js** 20+ (frontend)
- **.NET SDK** 8.0 (backend)

## Hızlı Başlangıç

### 1. Backend (API)

```powershell
cd backend\WebApplication1
dotnet restore
dotnet run
```
Backend’i yeniden başlatmak isterseniz
Önce çalışan süreci kapatın, sonra tekrar başlatın:

```powershell
Get-Process -Name "WebApplication1" -ErrorAction SilentlyContinue | Stop-Process -Force
cd \backend\WebApplication1
dotnet run
```

API adresi: **http://localhost:5030**  
Swagger: **http://localhost:5030/swagger**

### 2. Frontend

Yeni bir terminal açın:

```powershell
cd frontend\login
npm install
npm run dev
```

Uygulama: **http://localhost:3000**

## Giriş Bilgileri

| Alan | Değer |
|------|-------|
| Kullanıcı adı | `admin` |
| Parola | `ako2026` |

## Özellikler

- JWT ile güvenli oturum
- CSV, JSON, XLSX dosya yükleme
- POST ile JSON veri gönderme
- Sıralı kural motoru (sil / tut / işaretle)
- Aydınlık ve karanlık tema

## API Uç Noktaları

| Metot | URL | Auth | Açıklama |
|-------|-----|------|----------|
| POST | `/api/auth/login` | Hayır | Giriş, JWT döner |
| GET | `/api/data` | Evet | Tüm kayıtları listele |
| POST | `/api/data/upload` | Evet | Dosya veya JSON yükle |
| POST | `/api/data/pipeline` | Evet | Kuralları uygula |

## Örnek Veri

`samples/ornek_veri.csv` dosyasını dashboard'dan yükleyebilirsiniz.

## Proje Yapısı

```
A/
├── backend/WebApplication1/   # .NET Core API
├── frontend/login/            # Next.js uygulaması
├── samples/                   # Örnek veri dosyaları
└── SUNUM.md                   # Sunum metni
```

## Sorun Giderme

**Frontend API'ye bağlanamıyor:** Backend'in 5030 portunda çalıştığından emin olun. `frontend/login/.env.local` dosyasında `NEXT_PUBLIC_API_URL=http://localhost:5030` olmalı.

**401 hatası:** Oturum süresi dolmuş olabilir; çıkış yapıp tekrar giriş yapın.

**Veritabanı sıfırlama:** `backend/WebApplication1/ako_data.db` dosyasını silip backend'i yeniden başlatın.
