using WebApplication1.Models;

namespace WebApplication1.Services;

public static class MessyDataGenerator
{
    private static readonly string[] Ads =
    [
        "Ayşe", "Mehmet", "Zeynep", "Ali", "Fatma", "Burak", "Elif", "Hasan", "Selin", "Emre",
        "Deniz", "Gül", "Cem", "Merve", "Okan", "Can", "Leyla", "Serkan", "Aslı", "Tunç",
        "Ece", "Kaan", "Naz", "Barış", "Dilara", "Furkan", "Hale", "İrem", "Jale", "Koray"
    ];

    private static readonly string[] Soyads =
    [
        "Yılmaz", "Demir", "Kaya", "Çelik", "Arslan", "Öztürk", "Şahin", "Koç", "Aydın", "Polat",
        "Aksoy", "Erdoğan", "Yıldız", "Güneş", "Tekin", "Korkmaz", "Mutlu", "Ergin", "Yavuz", "Tan"
    ];

    private static readonly string[] Departmanlar =
    [
        "İnsan Kaynakları", "Üretim", "Finans", "IT", "Satış", "Pazarlama", "Lojistik", "Yönetim",
        "it", "BILGI ISLEM", "finans dept", "???", "Üretim ", "  Satış", "", "insan kaynakları"
    ];

    private static readonly string[] Durumlar =
    [
        "Aktif", "Pasif", "İzinli", "aktif", "AKTIF", "pasif", "bilinmiyor", "", "Aktif ", "İZİNLİ"
    ];

    private static readonly string[] Kategoriler = ["", "", "", "A", "B", "C", "VIP", "???", "eski", "—"];

    public static List<DataRecordEntity> Generate(int count, int seed = 42)
    {
        var rng = new Random(seed);
        var list = new List<DataRecordEntity>(count);

        for (var i = 1; i <= count; i++)
        {
            var corrupt = rng.Next(100);
            var ad = corrupt < 8 ? "" : corrupt < 12 ? "???" : Ads[rng.Next(Ads.Length)];
            var soyad = corrupt < 6 ? "" : Soyads[rng.Next(Soyads.Length)];
            var yas = corrupt < 10 ? 0 : corrupt < 14 ? rng.Next(150, 999) : rng.Next(22, 65);
            var maas = corrupt < 12 ? 0 : corrupt < 16 ? rng.Next(1, 5000) : rng.Next(28000, 98000);
            var departman = Departmanlar[rng.Next(Departmanlar.Length)];
            var durum = Durumlar[rng.Next(Durumlar.Length)];
            var kategori = Kategoriler[rng.Next(Kategoriler.Length)];
            var iseGiris = corrupt < 15
                ? rng.Next(3) switch { 0 => "", 1 => "00/00/0000", _ => "2019-99-99" }
                : $"{rng.Next(1995, 2024):D4}-{rng.Next(1, 12):D2}-{rng.Next(1, 28):D2}";

            if (corrupt < 5) ad = ad.ToUpperInvariant();
            if (corrupt > 92 && i % 7 == 0) maas = maas * -1;

            list.Add(new DataRecordEntity
            {
                Id = i,
                Ad = ad,
                Soyad = soyad,
                Yas = yas,
                Departman = departman,
                Maas = maas,
                Durum = durum,
                IseGiris = iseGiris,
                Kategori = kategori
            });
        }

        return list;
    }
}
