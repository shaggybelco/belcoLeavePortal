using LeavePlatform.API.DTOs.LeaveBalance;

namespace LeavePlatform.API.Services.Interfaces;

public interface ILeaveBalanceService
{
    Task<IEnumerable<LeaveBalanceDto>> GetByUserAsync(Guid userId, int year);
}
