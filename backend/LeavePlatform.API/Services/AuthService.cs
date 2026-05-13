using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LeavePlatform.API.DTOs.Auth;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace LeavePlatform.API.Services;

public class AuthService(IUserRepository userRepository, IConfiguration config) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await userRepository.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException("Email is already registered.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        var created = await userRepository.CreateAsync(user);
        return BuildResponse(created);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await userRepository.GetByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        return BuildResponse(user);
    }

    private AuthResponseDto BuildResponse(User user) => new()
    {
        Token = GenerateToken(user),
        Email = user.Email,
        FullName = $"{user.FirstName} {user.LastName}",
        Role = user.Role.ToString(),
        UserId = user.Id
    };

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddHours(int.Parse(config["Jwt:ExpiryHours"] ?? "24"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(ClaimTypes.GivenName, user.FirstName)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
