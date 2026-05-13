using LeavePlatform.API.DTOs.Auth;

namespace LeavePlatform.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
