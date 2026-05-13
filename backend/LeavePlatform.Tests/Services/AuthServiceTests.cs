using FluentAssertions;
using LeavePlatform.API.DTOs.Auth;
using LeavePlatform.API.Enums;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace LeavePlatform.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly IConfiguration _config;

    public AuthServiceTests()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "test-secret-key-must-be-at-least-32-characters-long!!",
            ["Jwt:Issuer"] = "LeavePlatform",
            ["Jwt:Audience"] = "LeavePlatformUsers",
            ["Jwt:ExpiryHours"] = "24"
        };
        _config = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ReturnsTokenAndUserInfo()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync("john@example.com")).ReturnsAsync((User?)null);
        _userRepoMock.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);

        var service = new AuthService(_userRepoMock.Object, _config);
        var result = await service.RegisterAsync(new RegisterDto
        {
            FirstName = "John", LastName = "Doe",
            Email = "john@example.com", Password = "Password123!"
        });

        result.Token.Should().NotBeNullOrEmpty();
        result.Email.Should().Be("john@example.com");
        result.Role.Should().Be(UserRole.Employee.ToString());
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ThrowsInvalidOperationException()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync("existing@example.com"))
            .ReturnsAsync(new User { FirstName = "A", LastName = "B", Email = "existing@example.com", PasswordHash = "x" });

        var service = new AuthService(_userRepoMock.Object, _config);

        await service.Invoking(s => s.RegisterAsync(new RegisterDto
        {
            FirstName = "John", LastName = "Doe",
            Email = "existing@example.com", Password = "Password123!"
        }))
        .Should().ThrowAsync<InvalidOperationException>()
        .WithMessage("*already registered*");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsToken()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        _userRepoMock.Setup(r => r.GetByEmailAsync("john@example.com"))
            .ReturnsAsync(new User { FirstName = "John", LastName = "Doe", Email = "john@example.com", PasswordHash = hash, Role = UserRole.Employee });

        var service = new AuthService(_userRepoMock.Object, _config);
        var result = await service.LoginAsync(new LoginDto { Email = "john@example.com", Password = "Password123!" });

        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ThrowsUnauthorizedAccessException()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword!");
        _userRepoMock.Setup(r => r.GetByEmailAsync("john@example.com"))
            .ReturnsAsync(new User { FirstName = "John", LastName = "Doe", Email = "john@example.com", PasswordHash = hash });

        var service = new AuthService(_userRepoMock.Object, _config);

        await service.Invoking(s => s.LoginAsync(new LoginDto { Email = "john@example.com", Password = "WrongPassword!" }))
            .Should().ThrowAsync<UnauthorizedAccessException>();
    }
}
