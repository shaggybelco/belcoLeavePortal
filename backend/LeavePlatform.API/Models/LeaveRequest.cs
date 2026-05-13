using LeavePlatform.API.Enums;

namespace LeavePlatform.API.Models;

public class LeaveRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid LeaveTypeId { get; set; }
    public LeaveType LeaveType { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }
    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;
    public string? EmployeeComment { get; set; }
    public string? ManagerComment { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public User? ReviewedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
