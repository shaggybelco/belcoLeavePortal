namespace LeavePlatform.API.DTOs.LeaveRequest;

public class ReviewLeaveRequestDto
{
    public string Action { get; set; } = string.Empty; // "Approve" or "Reject"
    public string? ManagerComment { get; set; }
}
