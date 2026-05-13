using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task<IEnumerable<User>> GetByManagerIdAsync(Guid managerId);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
}
