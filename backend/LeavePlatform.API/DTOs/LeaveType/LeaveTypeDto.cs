namespace LeavePlatform.API.DTOs.LeaveType;

public class LeaveTypeDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int DefaultDays { get; set; }
    public bool IsActive { get; set; }
}
