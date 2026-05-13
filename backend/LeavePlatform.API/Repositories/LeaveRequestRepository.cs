using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class LeaveRequestRepository(AppDbContext context) : ILeaveRequestRepository
{
    private IQueryable<LeaveRequest> WithIncludes() =>
        context.LeaveRequests
            .Include(r => r.User)
            .Include(r => r.LeaveType)
            .Include(r => r.ReviewedBy);

    public async Task<IEnumerable<LeaveRequest>> GetByUserIdAsync(Guid userId) =>
        await WithIncludes().Where(r => r.UserId == userId).ToListAsync();

    public async Task<IEnumerable<LeaveRequest>> GetByManagerIdAsync(Guid managerId) =>
        await WithIncludes().Where(r => r.User.ManagerId == managerId).ToListAsync();

    public async Task<IEnumerable<LeaveRequest>> GetAllAsync() =>
        await WithIncludes().ToListAsync();

    public async Task<LeaveRequest?> GetByIdAsync(Guid id) =>
        await WithIncludes().FirstOrDefaultAsync(r => r.Id == id);

    public async Task<LeaveRequest> CreateAsync(LeaveRequest request)
    {
        context.LeaveRequests.Add(request);
        await context.SaveChangesAsync();
        return request;
    }

    public async Task<LeaveRequest> UpdateAsync(LeaveRequest request)
    {
        request.UpdatedAt = DateTime.UtcNow;
        context.LeaveRequests.Update(request);
        await context.SaveChangesAsync();
        return request;
    }
}
