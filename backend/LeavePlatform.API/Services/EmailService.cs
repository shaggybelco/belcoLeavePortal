using Resend;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class EmailService(IResend resend, IConfiguration configuration) : IEmailService
{
    private string FromAddress => configuration["Resend:FromEmail"] ?? "noreply@leaveplatform.com";

    public async Task SendLeaveRequestSubmittedAsync(
        string employeeEmail, string employeeName, string leaveTypeName,
        DateOnly start, DateOnly end)
    {
        var message = new EmailMessage
        {
            From = FromAddress,
            To = { employeeEmail },
            Subject = "Leave Request Submitted",
            HtmlBody = $"""
                <p>Hi {employeeName},</p>
                <p>Your <strong>{leaveTypeName}</strong> leave request from <strong>{start}</strong> to <strong>{end}</strong> has been submitted and is pending approval.</p>
                <p>You will be notified once a manager reviews it.</p>
                """
        };

        await resend.EmailSendAsync(message);
    }

    public async Task SendLeaveRequestReviewedAsync(
        string employeeEmail, string employeeName, string leaveTypeName,
        string status, string? managerComment)
    {
        var message = new EmailMessage
        {
            From = FromAddress,
            To = { employeeEmail },
            Subject = $"Leave Request {status}",
            HtmlBody = $"""
                <p>Hi {employeeName},</p>
                <p>Your <strong>{leaveTypeName}</strong> leave request has been <strong>{status.ToLower()}</strong>.</p>
                {(string.IsNullOrWhiteSpace(managerComment) ? "" : $"<p><em>Manager comment: {managerComment}</em></p>")}
                """
        };

        await resend.EmailSendAsync(message);
    }
}
