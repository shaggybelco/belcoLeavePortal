using LeavePlatform.API.DTOs.User;
using LeavePlatform.API.Enums;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class UserService(
    IUserRepository userRepository,
    ILeaveTypeRepository leaveTypeRepository,
    ILeaveBalanceRepository leaveBalanceRepository,
    IAuditLogRepository auditLogRepository) : IUserService
{
    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto> GetByIdAsync(Guid id)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");
        return MapToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, Guid actorId)
    {
        var existing = await userRepository.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException("Email is already registered.");

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new ArgumentException("Invalid role. Use Employee, Manager, or Admin.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            DepartmentId = dto.DepartmentId,
            ManagerId = dto.ManagerId
        };

        var created = await userRepository.CreateAsync(user);

        await auditLogRepository.CreateAsync(new AuditLog
        {
            UserId     = actorId,
            Action     = "Created",
            EntityType = "User",
            EntityId   = created.Id.ToString()
        });

        // Seed a leave balance row for each active leave type
        var leaveTypes = await leaveTypeRepository.GetAllAsync(activeOnly: true);
        foreach (var lt in leaveTypes)
        {
            await leaveBalanceRepository.CreateAsync(new LeaveBalance
            {
                UserId = created.Id,
                LeaveTypeId = lt.Id,
                Year = DateTime.UtcNow.Year,
                TotalDays = lt.DefaultDays,
                UsedDays = 0
            });
        }

        return MapToDto(created);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid actorId)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new ArgumentException("Invalid role. Use Employee, Manager, or Admin.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Role = role;
        user.DepartmentId = dto.DepartmentId;
        user.ManagerId = dto.ManagerId;
        user.IsActive = dto.IsActive;

        var updated = await userRepository.UpdateAsync(user);

        await auditLogRepository.CreateAsync(new AuditLog
        {
            UserId     = actorId,
            Action     = "Updated",
            EntityType = "User",
            EntityId   = id.ToString()
        });

        return MapToDto(updated);
    }

    public async Task DeactivateAsync(Guid id, Guid actorId)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");

        user.IsActive = false;
        await userRepository.UpdateAsync(user);

        await auditLogRepository.CreateAsync(new AuditLog
        {
            UserId     = actorId,
            Action     = "Deactivated",
            EntityType = "User",
            EntityId   = id.ToString()
        });
    }

    public async Task ResetPasswordAsync(Guid id, string newPassword, Guid actorId)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await userRepository.UpdateAsync(user);

        await auditLogRepository.CreateAsync(new AuditLog
        {
            UserId     = actorId,
            Action     = "PasswordReset",
            EntityType = "User",
            EntityId   = id.ToString()
        });
    }

    private static UserDto MapToDto(User u) => new()
    {
        Id = u.Id,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        Role = u.Role.ToString(),
        Department = u.Department?.Name,
        DepartmentId = u.DepartmentId,
        ManagerId = u.ManagerId,
        ManagerName = u.Manager is not null ? $"{u.Manager.FirstName} {u.Manager.LastName}" : null,
        IsActive = u.IsActive
    };
}
