using LeavePlatform.API.DTOs.LeaveType;

namespace LeavePlatform.API.Services.Interfaces;

public interface ILeaveTypeService
{
    Task<IEnumerable<LeaveTypeDto>> GetAllAsync();
    Task<LeaveTypeDto> CreateAsync(CreateLeaveTypeDto dto);
    Task<LeaveTypeDto> UpdateAsync(Guid id, UpdateLeaveTypeDto dto);
    Task DeactivateAsync(Guid id);
}
