using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface ILeaveRequestRepository
{
    Task<IEnumerable<LeaveRequest>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<LeaveRequest>> GetByManagerIdAsync(Guid managerId);
    Task<IEnumerable<LeaveRequest>> GetAllAsync();
    Task<LeaveRequest?> GetByIdAsync(Guid id);
    Task<LeaveRequest> CreateAsync(LeaveRequest request);
    Task<LeaveRequest> UpdateAsync(LeaveRequest request);
}
