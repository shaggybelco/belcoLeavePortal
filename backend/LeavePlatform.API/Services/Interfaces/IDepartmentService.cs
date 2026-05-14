using LeavePlatform.API.DTOs.Department;

namespace LeavePlatform.API.Services.Interfaces;

public interface IDepartmentService
{
    Task<IEnumerable<DepartmentDto>> GetAllAsync();
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto);
    Task<DepartmentDto> UpdateAsync(Guid id, CreateDepartmentDto dto);
}
