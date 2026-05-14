using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface ILeaveTypeRepository
{
    Task<IEnumerable<LeaveType>> GetAllAsync(bool activeOnly = true);
    Task<LeaveType?> GetByIdAsync(Guid id);
    Task<LeaveType> CreateAsync(LeaveType leaveType);
    Task<LeaveType> UpdateAsync(LeaveType leaveType);
}
