namespace WebApplication1.DTOs;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, string Username, DateTime ExpiresAt);

public record RuleConditionDto(string Field, string Operator, string Value);

public record PipelineRuleDto(
    string Id,
    string Field,
    string Operator,
    string Value,
    string Action,
    bool Enabled,
    List<RuleConditionDto>? Conditions = null,
    string? TargetField = null,
    string? AssignValue = null,
    string? TransformOp = null,
    string? Label = null
);

public record PipelineRequest(List<PipelineRuleDto> Rules);

public record PipelineResponse(
    List<Dictionary<string, object?>> Rows,
    int Removed,
    int Flagged,
    int Assigned,
    int Transformed,
    int Remaining,
    int Total
);

public record UploadResponse(string Message, int Count);
