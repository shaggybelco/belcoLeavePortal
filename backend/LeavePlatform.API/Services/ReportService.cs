using LeavePlatform.API.Data;
using LeavePlatform.API.DTOs.Report;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Services;

public class ReportService(AppDbContext context, IAuditLogRepository auditLogRepository) : IReportService
{
    public async Task<IEnumerable<LeaveSummaryDto>> GetLeaveSummaryAsync(int year)
    {
        var balances = await context.LeaveBalances
            .Include(b => b.User).ThenInclude(u => u.Department)
            .Include(b => b.LeaveType)
            .Where(b => b.Year == year)
            .ToListAsync();

        return balances.Select(b => new LeaveSummaryDto
        {
            UserId = b.UserId,
            EmployeeName = $"{b.User.FirstName} {b.User.LastName}",
            Department = b.User.Department?.Name,
            LeaveTypeName = b.LeaveType.Name,
            Year = b.Year,
            TotalDays = b.TotalDays,
            UsedDays = b.UsedDays,
            RemainingDays = b.RemainingDays
        });
    }

    public async Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync(int count)
    {
        var logs = await auditLogRepository.GetRecentAsync(count);
        return logs.Select(l => new AuditLogDto
        {
            Id = l.Id,
            EmployeeName = $"{l.User.FirstName} {l.User.LastName}",
            Action = l.Action,
            EntityType = l.EntityType,
            EntityId = l.EntityId,
            CreatedAt = l.CreatedAt
        });
    }
}
