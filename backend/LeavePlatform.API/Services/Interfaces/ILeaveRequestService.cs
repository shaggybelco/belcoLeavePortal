using LeavePlatform.API.DTOs.LeaveRequest;

namespace LeavePlatform.API.Services.Interfaces;

public interface ILeaveRequestService
{
    Task<IEnumerable<LeaveRequestDto>> GetMyRequestsAsync(Guid userId);
    Task<IEnumerable<LeaveRequestDto>> GetTeamRequestsAsync(Guid managerId);
    Task<IEnumerable<LeaveRequestDto>> GetAllAsync();
    Task<LeaveRequestDto> CreateAsync(Guid userId, CreateLeaveRequestDto dto);
    Task<LeaveRequestDto> ReviewAsync(Guid requestId, Guid reviewerId, ReviewLeaveRequestDto dto);
    Task CancelAsync(Guid requestId, Guid userId);
}
