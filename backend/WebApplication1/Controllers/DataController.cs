using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.DTOs;
using WebApplication1.Models;
using WebApplication1.Services;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DataController(AppDbContext db, DataImportService importService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Dictionary<string, object?>>>> GetAll(CancellationToken ct)
    {
        var records = await db.DataRecords.OrderBy(r => r.Id).ToListAsync(ct);
        return Ok(records.Select(DataPipelineService.ToDict).ToList());
    }

    [HttpPost("upload")]
    [RequestSizeLimit(20_000_000)]
    public async Task<ActionResult<UploadResponse>> Upload(CancellationToken ct)
    {
        try
        {
            List<DataRecordEntity> records;

            if (Request.HasFormContentType && Request.Form.Files.Count > 0)
            {
                var file = Request.Form.Files[0];
                await using var stream = file.OpenReadStream();
                records = file.FileName.ToLowerInvariant() switch
                {
                    var n when n.EndsWith(".json") => DataImportService.ParseJson(stream),
                    var n when n.EndsWith(".csv") => DataImportService.ParseCsv(stream),
                    var n when n.EndsWith(".xlsx") || n.EndsWith(".xls") => DataImportService.ParseXlsx(stream),
                    _ => throw new InvalidOperationException("Desteklenen formatlar: CSV, JSON, XLSX")
                };
            }
            else
            {
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync(ct);
                if (string.IsNullOrWhiteSpace(body))
                    return BadRequest(new { message = "Yüklenecek veri bulunamadı." });

                await using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(body));
                records = DataImportService.ParseJson(stream);
            }

            if (records.Count == 0)
                return BadRequest(new { message = "Dosyadan okunan kayıt bulunamadı." });

            var count = await importService.ImportRecordsAsync(records, ct);
            return Ok(new UploadResponse($"{count} kayıt başarıyla yüklendi.", count));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("pipeline")]
    public async Task<ActionResult<PipelineResponse>> ApplyPipeline([FromBody] PipelineRequest request, CancellationToken ct)
    {
        var data = await db.DataRecords.OrderBy(r => r.Id).ToListAsync(ct);
        var result = DataPipelineService.Apply(data, request.Rules);
        return Ok(result);
    }
}
