namespace LeavePlatform.API.DTOs.LeaveRequest;

public class CreateLeaveRequestDto
{
    public Guid LeaveTypeId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? EmployeeComment { get; set; }
}
