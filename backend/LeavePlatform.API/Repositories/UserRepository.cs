using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<User?> GetByIdAsync(Guid id) =>
        await context.Users
            .Include(u => u.Department)
            .Include(u => u.Manager)
            .FirstOrDefaultAsync(u => u.Id == id);

    public async Task<User?> GetByEmailAsync(string email) =>
        await context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower());

    public async Task<IEnumerable<User>> GetAllAsync() =>
        await context.Users
            .Include(u => u.Department)
            .Include(u => u.Manager)
            .Where(u => u.IsActive)
            .ToListAsync();

    public async Task<IEnumerable<User>> GetByManagerIdAsync(Guid managerId) =>
        await context.Users
            .Where(u => u.ManagerId == managerId && u.IsActive)
            .ToListAsync();

    public async Task<User> CreateAsync(User user)
    {
        user.Email = user.Email.ToLower();
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        context.Users.Update(user);
        await context.SaveChangesAsync();
        return user;
    }
}
