namespace LeavePlatform.API.Models;

public class LeaveType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public int DefaultDays { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<LeaveBalance> LeaveBalances { get; set; } = [];
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = [];
}
