using System.Globalization;
using WebApplication1.DTOs;
using WebApplication1.Models;

namespace WebApplication1.Services;

public static class DataPipelineService
{
    public static PipelineResponse Apply(IReadOnlyList<DataRecordEntity> data, List<PipelineRuleDto> rules)
    {
        var rows = data.Select(r => ToDict(r)).ToList();
        var removed = 0;
        var flagged = 0;
        var assigned = 0;
        var transformed = 0;

        foreach (var rule in rules.Where(r => r.Enabled))
        {
            var next = new List<Dictionary<string, object?>>();

            foreach (var row in rows)
            {
                var hit = MatchesAll(row, rule);
                var action = rule.Action.ToLowerInvariant();

                switch (action)
                {
                    case "sil":
                        if (hit) { removed++; continue; }
                        next.Add(row);
                        break;
                    case "tut":
                        if (hit) next.Add(row);
                        else removed++;
                        break;
                    case "işaretle":
                    case "isaretle":
                        if (hit)
                        {
                            flagged++;
                            next.Add(new Dictionary<string, object?>(row) { ["__flagged"] = true });
                        }
                        else next.Add(row);
                        break;
                    case "ata":
                        if (hit && !string.IsNullOrWhiteSpace(rule.TargetField) && rule.AssignValue != null)
                        {
                            assigned++;
                            next.Add(ApplyAssign(row, rule));
                        }
                        else next.Add(row);
                        break;
                    case "dönüştür":
                    case "donustur":
                        if (hit && !string.IsNullOrWhiteSpace(rule.TargetField) && !string.IsNullOrWhiteSpace(rule.TransformOp))
                        {
                            transformed++;
                            next.Add(ApplyTransform(row, rule));
                        }
                        else next.Add(row);
                        break;
                    default:
                        next.Add(row);
                        break;
                }
            }

            rows = next;
        }

        return new PipelineResponse(rows, removed, flagged, assigned, transformed, rows.Count, data.Count);
    }

    private static Dictionary<string, object?> ApplyAssign(Dictionary<string, object?> row, PipelineRuleDto rule)
    {
        var copy = new Dictionary<string, object?>(row);
        var target = NormalizeField(rule.TargetField!);
        copy[target] = CoerceAssignValue(target, rule.AssignValue!);
        copy["__assigned"] = true;
        AppendLog(copy, rule.Id, target, rule.AssignValue!, rule.Label ?? rule.AssignValue!);
        return copy;
    }

    private static Dictionary<string, object?> ApplyTransform(Dictionary<string, object?> row, PipelineRuleDto rule)
    {
        var copy = new Dictionary<string, object?>(row);
        var target = NormalizeField(rule.TargetField!);
        var current = Convert.ToString(copy.GetValueOrDefault(target)) ?? "";
        var newVal = TransformValue(current, rule.TransformOp!);
        copy[target] = target is "yas" or "maas" && decimal.TryParse(newVal, out var num) ? num : newVal;
        copy["__transformed"] = true;
        AppendLog(copy, rule.Id, target, newVal, rule.Label ?? rule.TransformOp!);
        return copy;
    }

    private static void AppendLog(Dictionary<string, object?> copy, string ruleId, string field, string value, string label)
    {
        var assignments = copy.TryGetValue("__atamalar", out var existing) && existing is List<object> list
            ? list
            : new List<object>();
        if (assignments is List<object> log)
        {
            log.Add(new Dictionary<string, object?>
            {
                ["ruleId"] = ruleId,
                ["field"] = field,
                ["value"] = value,
                ["label"] = label
            });
            copy["__atamalar"] = log;
        }
    }

    private static string TransformValue(string value, string op) => op.ToLowerInvariant() switch
    {
        "büyük_harf" or "buyuk_harf" => value.ToUpper(new CultureInfo("tr-TR")),
        "küçük_harf" or "kucuk_harf" => value.ToLower(new CultureInfo("tr-TR")),
        "trim" => string.Join(' ', value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries)),
        "baş_harf" or "bas_harf" => CultureInfo.CurrentCulture.TextInfo.ToTitleCase(value.ToLower(new CultureInfo("tr-TR"))),
        "durum_düzelt" or "durum_duzelt" => NormalizeDurum(value),
        "temizle" => "",
        _ => value
    };

    private static string NormalizeDurum(string value)
    {
        var d = value.Trim().ToLowerInvariant();
        if (d.Contains("aktif")) return "Aktif";
        if (d.Contains("pasif")) return "Pasif";
        if (d.Contains("izin")) return "İzinli";
        return "Aktif";
    }

    private static object? CoerceAssignValue(string field, string value)
    {
        if (field is "yas") return int.TryParse(value, out var i) ? i : value;
        if (field is "maas") return decimal.TryParse(value, out var d) ? d : value;
        return value;
    }

    private static bool MatchesAll(Dictionary<string, object?> row, PipelineRuleDto rule)
    {
        var conditions = rule.Conditions?.Count > 0
            ? rule.Conditions
            : [new RuleConditionDto(rule.Field, rule.Operator, rule.Value)];

        return conditions.All(c => MatchesCondition(row, c.Field, c.Operator, c.Value));
    }

    private static bool IsEmpty(object? raw, string field)
    {
        if (field is "maas" or "yas")
            return raw == null || (decimal.TryParse(Convert.ToString(raw), out var n) && n == 0);
        return string.IsNullOrWhiteSpace(Convert.ToString(raw));
    }

    private static bool MatchesCondition(Dictionary<string, object?> row, string field, string op, string value)
    {
        row.TryGetValue(NormalizeField(field), out var raw);
        raw ??= row.GetValueOrDefault(field);

        if (op is "boş" or "bos") return IsEmpty(raw, NormalizeField(field));
        if (op is "dolu") return !IsEmpty(raw, NormalizeField(field));

        if (raw == null) return false;

        var fieldText = Convert.ToString(raw)?.Trim().ToLowerInvariant() ?? "";
        var compareText = value.Trim().ToLowerInvariant();

        if (decimal.TryParse(Convert.ToString(raw), out var fieldNum) && decimal.TryParse(value, out var compareNum))
        {
            return op switch
            {
                ">" => fieldNum > compareNum,
                "<" => fieldNum < compareNum,
                ">=" => fieldNum >= compareNum,
                "<=" => fieldNum <= compareNum,
                "=" => fieldNum == compareNum,
                "!=" => fieldNum != compareNum,
                _ => false
            };
        }

        return op switch
        {
            "=" => fieldText == compareText,
            "!=" => fieldText != compareText,
            "içerir" or "icerir" => fieldText.Contains(compareText),
            "başlar" or "baslar" => fieldText.StartsWith(compareText),
            "biter" => fieldText.EndsWith(compareText),
            _ => false
        };
    }

    private static string NormalizeField(string field) => field.Trim().ToLowerInvariant() switch
    {
        "yas" => "yas",
        "maas" => "maas",
        "departman" => "departman",
        "durum" => "durum",
        "ad" => "ad",
        "soyad" => "soyad",
        "isegiris" => "iseGiris",
        "kategori" => "kategori",
        _ => field
    };

    public static Dictionary<string, object?> ToDict(DataRecordEntity record) => new()
    {
        ["id"] = record.Id,
        ["ad"] = record.Ad,
        ["soyad"] = record.Soyad,
        ["yas"] = record.Yas,
        ["departman"] = record.Departman,
        ["maas"] = record.Maas,
        ["durum"] = record.Durum,
        ["iseGiris"] = record.IseGiris,
        ["kategori"] = record.Kategori,
        ["__bozuk"] = DetectIssues(record)
    };

    private static List<string> DetectIssues(DataRecordEntity r)
    {
        var issues = new List<string>();
        if (string.IsNullOrWhiteSpace(r.Ad) || r.Ad is "???" or "—") issues.Add("eksik_ad");
        if (string.IsNullOrWhiteSpace(r.Soyad)) issues.Add("eksik_soyad");
        if (r.Yas <= 0 || r.Yas > 120) issues.Add("gecersiz_yas");
        if (r.Maas <= 0) issues.Add("gecersiz_maas");
        if (string.IsNullOrWhiteSpace(r.Departman) || r.Departman is "???" or "—") issues.Add("bozuk_departman");
        if (string.IsNullOrWhiteSpace(r.Durum) || r.Durum is "bilinmiyor" or "???") issues.Add("bozuk_durum");
        if (string.IsNullOrWhiteSpace(r.IseGiris) || r.IseGiris.Contains("99") || r.IseGiris.Contains("00/00")) issues.Add("bozuk_tarih");
        return issues;
    }
}
