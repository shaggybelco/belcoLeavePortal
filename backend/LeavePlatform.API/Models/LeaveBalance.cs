namespace LeavePlatform.API.Models;

public class LeaveBalance
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid LeaveTypeId { get; set; }
    public LeaveType LeaveType { get; set; } = null!;
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }

    public int RemainingDays => TotalDays - UsedDays;
}
