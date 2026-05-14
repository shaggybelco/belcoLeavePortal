using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface IAuditLogRepository
{
    Task<IEnumerable<AuditLog>> GetRecentAsync(int count);
    Task CreateAsync(AuditLog log);
}
