namespace LeavePlatform.API.DTOs.LeaveRequest;

public class LeaveRequestDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public Guid LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? EmployeeComment { get; set; }
    public string? ManagerComment { get; set; }
    public string? ReviewedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}
