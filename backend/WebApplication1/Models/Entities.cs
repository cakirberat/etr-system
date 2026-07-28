namespace WebApplication1.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}

public class DataRecordEntity
{
    public int Id { get; set; }
    public string Ad { get; set; } = string.Empty;
    public string Soyad { get; set; } = string.Empty;
    public int Yas { get; set; }
    public string Departman { get; set; } = string.Empty;
    public decimal Maas { get; set; }
    public string Durum { get; set; } = "Aktif";
    public string IseGiris { get; set; } = string.Empty;
    public string Kategori { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
