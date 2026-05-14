using LeavePlatform.API.DTOs.Report;

namespace LeavePlatform.API.Services.Interfaces;

public interface IReportService
{
    Task<IEnumerable<LeaveSummaryDto>> GetLeaveSummaryAsync(int year);
    Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync(int count);
}
