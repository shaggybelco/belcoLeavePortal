using LeavePlatform.API.DTOs.LeaveType;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class LeaveTypeService(ILeaveTypeRepository leaveTypeRepository) : ILeaveTypeService
{
    public async Task<IEnumerable<LeaveTypeDto>> GetAllAsync()
    {
        var types = await leaveTypeRepository.GetAllAsync();
        return types.Select(MapToDto);
    }

    public async Task<LeaveTypeDto> CreateAsync(CreateLeaveTypeDto dto)
    {
        var leaveType = new LeaveType { Name = dto.Name, DefaultDays = dto.DefaultDays };
        var created = await leaveTypeRepository.CreateAsync(leaveType);
        return MapToDto(created);
    }

    public async Task<LeaveTypeDto> UpdateAsync(Guid id, UpdateLeaveTypeDto dto)
    {
        var leaveType = await leaveTypeRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Leave type not found.");

        leaveType.Name = dto.Name;
        leaveType.DefaultDays = dto.DefaultDays;
        leaveType.IsActive = dto.IsActive;

        return MapToDto(await leaveTypeRepository.UpdateAsync(leaveType));
    }

    public async Task DeactivateAsync(Guid id)
    {
        var leaveType = await leaveTypeRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Leave type not found.");

        leaveType.IsActive = false;
        await leaveTypeRepository.UpdateAsync(leaveType);
    }

    private static LeaveTypeDto MapToDto(LeaveType lt) => new()
    {
        Id = lt.Id,
        Name = lt.Name,
        DefaultDays = lt.DefaultDays,
        IsActive = lt.IsActive
    };
}
