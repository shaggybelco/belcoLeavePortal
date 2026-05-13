namespace LeavePlatform.API.DTOs.LeaveType;

public class UpdateLeaveTypeDto
{
    public required string Name { get; set; }
    public int DefaultDays { get; set; }
    public bool IsActive { get; set; }
}
