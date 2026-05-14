using LeavePlatform.API.DTOs.Department;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class DepartmentService(IDepartmentRepository departmentRepository) : IDepartmentService
{
    public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
    {
        var departments = await departmentRepository.GetAllAsync();
        return departments.Select(d => new DepartmentDto
        {
            Id = d.Id,
            Name = d.Name,
            UserCount = d.Users.Count(u => u.IsActive)
        });
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto)
    {
        var department = new Department { Name = dto.Name };
        var created = await departmentRepository.CreateAsync(department);
        return new DepartmentDto { Id = created.Id, Name = created.Name, UserCount = 0 };
    }

    public async Task<DepartmentDto> UpdateAsync(Guid id, CreateDepartmentDto dto)
    {
        var department = await departmentRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Department not found.");

        department.Name = dto.Name;
        var updated = await departmentRepository.UpdateAsync(department);
        return new DepartmentDto
        {
            Id = updated.Id,
            Name = updated.Name,
            UserCount = updated.Users.Count(u => u.IsActive)
        };
    }
}
