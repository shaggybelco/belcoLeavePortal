using LeavePlatform.API.DTOs.User;

namespace LeavePlatform.API.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> GetByIdAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserDto dto, Guid actorId);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid actorId);
    Task DeactivateAsync(Guid id, Guid actorId);
    Task ResetPasswordAsync(Guid id, string newPassword, Guid actorId);
}
