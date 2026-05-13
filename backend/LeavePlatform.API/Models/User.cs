using LeavePlatform.API.Enums;

namespace LeavePlatform.API.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.Employee;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public Guid? ManagerId { get; set; }
    public User? Manager { get; set; }

    public ICollection<User> DirectReports { get; set; } = [];
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = [];
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = [];
}
