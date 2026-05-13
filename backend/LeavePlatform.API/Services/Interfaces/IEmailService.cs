namespace LeavePlatform.API.Services.Interfaces;

public interface IEmailService
{
    Task SendLeaveRequestSubmittedAsync(string employeeEmail, string employeeName, string leaveTypeName, DateOnly start, DateOnly end);
    Task SendLeaveRequestReviewedAsync(string employeeEmail, string employeeName, string leaveTypeName, string status, string? managerComment);
}
