using LeavePlatform.API.DTOs.User;

namespace LeavePlatform.API.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> GetByIdAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto);
    Task DeactivateAsync(Guid id);
    Task ResetPasswordAsync(Guid id, string newPassword);
}
