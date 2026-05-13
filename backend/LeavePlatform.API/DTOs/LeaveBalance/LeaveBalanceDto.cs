namespace LeavePlatform.API.DTOs.LeaveBalance;

public class LeaveBalanceDto
{
    public Guid Id { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays { get; set; }
}
