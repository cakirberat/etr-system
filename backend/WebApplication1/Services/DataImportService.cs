using System.Globalization;
using System.Text;
using System.Text.Json;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Services;

public class DataImportService(AppDbContext db)
{
    public async Task<int> ImportRecordsAsync(IEnumerable<DataRecordEntity> records, CancellationToken ct = default)
    {
        var list = records.ToList();
        if (list.Count == 0) return 0;

        db.DataRecords.RemoveRange(db.DataRecords);
        await db.SaveChangesAsync(ct);

        await db.DataRecords.AddRangeAsync(list, ct);
        await db.SaveChangesAsync(ct);
        return list.Count;
    }

    public static List<DataRecordEntity> ParseJson(Stream stream)
    {
        using var doc = JsonDocument.Parse(stream);
        var root = doc.RootElement;

        if (root.ValueKind == JsonValueKind.Array)
            return root.EnumerateArray().Select(ParseJsonObject).Where(x => x != null).Cast<DataRecordEntity>().ToList();

        if (root.ValueKind == JsonValueKind.Object)
            return [ParseJsonObject(root)!];

        return [];
    }

    public static List<DataRecordEntity> ParseCsv(Stream stream)
    {
        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);
        var headerLine = reader.ReadLine();
        if (string.IsNullOrWhiteSpace(headerLine)) return [];

        var headers = SplitCsvLine(headerLine).Select(NormalizeHeader).ToList();
        var rows = new List<DataRecordEntity>();
        string? line;
        var index = 1;

        while ((line = reader.ReadLine()) != null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            var values = SplitCsvLine(line);
            var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < headers.Count && i < values.Count; i++)
                map[headers[i]] = values[i];

            rows.Add(MapToEntity(map, index++));
        }

        return rows;
    }

    public static List<DataRecordEntity> ParseXlsx(Stream stream)
    {
        using var workbook = new XLWorkbook(stream);
        var sheet = workbook.Worksheets.First();
        var used = sheet.RangeUsed();
        if (used == null) return [];

        var rows = used.RowsUsed().ToList();
        if (rows.Count < 2) return [];

        var headers = rows[0].Cells().Select(c => NormalizeHeader(c.GetString())).ToList();
        var result = new List<DataRecordEntity>();

        for (var i = 1; i < rows.Count; i++)
        {
            var cells = rows[i].Cells().ToList();
            var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (var j = 0; j < headers.Count && j < cells.Count; j++)
                map[headers[j]] = cells[j].GetString();

            result.Add(MapToEntity(map, i));
        }

        return result;
    }

    private static DataRecordEntity? ParseJsonObject(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object) return null;

        var map = element.EnumerateObject().ToDictionary(
            p => NormalizeHeader(p.Name),
            p => p.Value.ToString(),
            StringComparer.OrdinalIgnoreCase);

        return MapToEntity(map, 0);
    }

    private static DataRecordEntity MapToEntity(Dictionary<string, string> map, int fallbackId)
    {
        int.TryParse(Get(map, "id", "Id"), out var id);
        int.TryParse(Get(map, "yas", "Yas", "age", "Age"), out var yas);
        decimal.TryParse(Get(map, "maas", "Maas", "salary", "Salary"), NumberStyles.Any, CultureInfo.InvariantCulture, out var maas);

        return new DataRecordEntity
        {
            Id = id > 0 ? id : fallbackId,
            Ad = Get(map, "ad", "Ad", "name", "Name"),
            Soyad = Get(map, "soyad", "Soyad", "surname", "Surname"),
            Yas = yas,
            Departman = Get(map, "departman", "Departman", "department", "Department"),
            Maas = maas,
            Durum = string.IsNullOrWhiteSpace(Get(map, "durum", "Durum", "status", "Status")) ? "Aktif" : Get(map, "durum", "Durum", "status", "Status"),
            Kategori = Get(map, "kategori", "Kategori", "category", "Category"),
            IseGiris = Get(map, "iseGiris", "IseGiris", "ise_giris", "startDate", "StartDate")
        };
    }

    private static string Get(Dictionary<string, string> map, params string[] keys)
    {
        foreach (var key in keys)
            if (map.TryGetValue(NormalizeHeader(key), out var value) && !string.IsNullOrWhiteSpace(value))
                return value.Trim();
        return string.Empty;
    }

    private static string NormalizeHeader(string? header)
    {
        if (string.IsNullOrWhiteSpace(header)) return string.Empty;
        return header.Trim().ToLowerInvariant()
            .Replace(" ", "")
            .Replace("_", "")
            .Replace("ı", "i")
            .Replace("ş", "s")
            .Replace("ğ", "g")
            .Replace("ü", "u")
            .Replace("ö", "o")
            .Replace("ç", "c");
    }

    private static List<string> SplitCsvLine(string line)
    {
        var result = new List<string>();
        var current = new StringBuilder();
        var inQuotes = false;

        foreach (var ch in line)
        {
            if (ch == '"') { inQuotes = !inQuotes; continue; }
            if (ch == ',' && !inQuotes)
            {
                result.Add(current.ToString().Trim());
                current.Clear();
                continue;
            }
            current.Append(ch);
        }

        result.Add(current.ToString().Trim());
        return result;
    }
}
