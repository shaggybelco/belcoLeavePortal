using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface ILeaveBalanceRepository
{
    Task<IEnumerable<LeaveBalance>> GetByUserIdAsync(Guid userId, int year);
    Task<LeaveBalance?> GetByUserAndTypeAsync(Guid userId, Guid leaveTypeId, int year);
    Task<LeaveBalance> CreateAsync(LeaveBalance balance);
    Task<LeaveBalance> UpdateAsync(LeaveBalance balance);
}
