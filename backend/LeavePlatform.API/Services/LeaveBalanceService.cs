using LeavePlatform.API.DTOs.LeaveBalance;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class LeaveBalanceService(ILeaveBalanceRepository leaveBalanceRepository) : ILeaveBalanceService
{
    public async Task<IEnumerable<LeaveBalanceDto>> GetByUserAsync(Guid userId, int year)
    {
        var balances = await leaveBalanceRepository.GetByUserIdAsync(userId, year);
        return balances.Select(MapToDto);
    }

    private static LeaveBalanceDto MapToDto(LeaveBalance b) => new()
    {
        Id = b.Id,
        LeaveTypeName = b.LeaveType?.Name ?? string.Empty,
        Year = b.Year,
        TotalDays = b.TotalDays,
        UsedDays = b.UsedDays,
        RemainingDays = b.RemainingDays
    };
}
