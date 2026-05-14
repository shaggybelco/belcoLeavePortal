using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class LeaveTypeRepository(AppDbContext context) : ILeaveTypeRepository
{
    public async Task<IEnumerable<LeaveType>> GetAllAsync(bool activeOnly = true)
    {
        var query = context.LeaveTypes.AsQueryable();
        if (activeOnly) query = query.Where(lt => lt.IsActive);
        return await query.ToListAsync();
    }

    public async Task<LeaveType?> GetByIdAsync(Guid id) =>
        await context.LeaveTypes.FirstOrDefaultAsync(lt => lt.Id == id);

    public async Task<LeaveType> CreateAsync(LeaveType leaveType)
    {
        context.LeaveTypes.Add(leaveType);
        await context.SaveChangesAsync();
        return leaveType;
    }

    public async Task<LeaveType> UpdateAsync(LeaveType leaveType)
    {
        context.LeaveTypes.Update(leaveType);
        await context.SaveChangesAsync();
        return leaveType;
    }
}
