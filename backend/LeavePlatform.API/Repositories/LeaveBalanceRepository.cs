using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class LeaveBalanceRepository(AppDbContext context) : ILeaveBalanceRepository
{
    public async Task<IEnumerable<LeaveBalance>> GetByUserIdAsync(Guid userId, int year) =>
        await context.LeaveBalances
            .Include(b => b.LeaveType)
            .Where(b => b.UserId == userId && b.Year == year)
            .ToListAsync();

    public async Task<LeaveBalance?> GetByUserAndTypeAsync(Guid userId, Guid leaveTypeId, int year) =>
        await context.LeaveBalances
            .FirstOrDefaultAsync(b => b.UserId == userId && b.LeaveTypeId == leaveTypeId && b.Year == year);

    public async Task<LeaveBalance> CreateAsync(LeaveBalance balance)
    {
        context.LeaveBalances.Add(balance);
        await context.SaveChangesAsync();
        return balance;
    }

    public async Task<LeaveBalance> UpdateAsync(LeaveBalance balance)
    {
        context.LeaveBalances.Update(balance);
        await context.SaveChangesAsync();
        return balance;
    }
}
