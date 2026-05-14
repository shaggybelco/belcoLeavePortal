using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class DepartmentRepository(AppDbContext context) : IDepartmentRepository
{
    public async Task<IEnumerable<Department>> GetAllAsync() =>
        await context.Departments.Include(d => d.Users).ToListAsync();

    public async Task<Department?> GetByIdAsync(Guid id) =>
        await context.Departments.Include(d => d.Users).FirstOrDefaultAsync(d => d.Id == id);

    public async Task<Department> CreateAsync(Department department)
    {
        context.Departments.Add(department);
        await context.SaveChangesAsync();
        return department;
    }

    public async Task<Department> UpdateAsync(Department department)
    {
        context.Departments.Update(department);
        await context.SaveChangesAsync();
        return department;
    }
}
