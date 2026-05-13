using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class AuditLogRepository(AppDbContext context) : IAuditLogRepository
{
    public async Task<IEnumerable<AuditLog>> GetRecentAsync(int count) =>
        await context.AuditLogs
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Take(count)
            .ToListAsync();

    public async Task CreateAsync(AuditLog log)
    {
        context.AuditLogs.Add(log);
        await context.SaveChangesAsync();
    }
}
