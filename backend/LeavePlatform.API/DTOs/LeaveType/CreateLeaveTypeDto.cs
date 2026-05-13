namespace LeavePlatform.API.DTOs.LeaveType;

public class CreateLeaveTypeDto
{
    public required string Name { get; set; }
    public int DefaultDays { get; set; }
}
