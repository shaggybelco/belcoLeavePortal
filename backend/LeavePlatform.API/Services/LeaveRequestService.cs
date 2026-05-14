using LeavePlatform.API.DTOs.LeaveRequest;
using LeavePlatform.API.Enums;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class LeaveRequestService(
    ILeaveRequestRepository leaveRequestRepository,
    ILeaveBalanceRepository leaveBalanceRepository,
    IUserRepository userRepository,
    IEmailService emailService) : ILeaveRequestService
{
    public async Task<IEnumerable<LeaveRequestDto>> GetMyRequestsAsync(Guid userId) =>
        (await leaveRequestRepository.GetByUserIdAsync(userId)).Select(MapToDto);

    public async Task<IEnumerable<LeaveRequestDto>> GetTeamRequestsAsync(Guid managerId) =>
        (await leaveRequestRepository.GetByManagerIdAsync(managerId)).Select(MapToDto);

    public async Task<IEnumerable<LeaveRequestDto>> GetAllAsync() =>
        (await leaveRequestRepository.GetAllAsync()).Select(MapToDto);

    public async Task<LeaveRequestDto> CreateAsync(Guid userId, CreateLeaveRequestDto dto)
    {
        if (dto.EndDate < dto.StartDate)
            throw new ArgumentException("End date must be on or after start date.");

        var totalDays = dto.EndDate.DayNumber - dto.StartDate.DayNumber + 1;

        var year = dto.StartDate.Year;
        var balance = await leaveBalanceRepository.GetByUserAndTypeAsync(userId, dto.LeaveTypeId, year)
            ?? throw new InvalidOperationException("No leave balance found for this leave type and year.");

        if (balance.RemainingDays < totalDays)
            throw new InvalidOperationException(
                $"Insufficient leave balance. You have {balance.RemainingDays} day(s) remaining.");

        var request = new LeaveRequest
        {
            UserId = userId,
            LeaveTypeId = dto.LeaveTypeId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            TotalDays = totalDays,
            EmployeeComment = dto.EmployeeComment
        };

        var created = await leaveRequestRepository.CreateAsync(request);

        // Reload with navigation properties
        var full = await leaveRequestRepository.GetByIdAsync(created.Id);

        // Fire-and-forget: don't fail the request if email fails
        var employee = await userRepository.GetByIdAsync(userId);
        if (employee is not null)
        {
            _ = emailService.SendLeaveRequestSubmittedAsync(
                employee.Email,
                $"{employee.FirstName} {employee.LastName}",
                full!.LeaveType?.Name ?? string.Empty,
                full.StartDate,
                full.EndDate);
        }

        return MapToDto(full!);
    }

    public async Task<LeaveRequestDto> ReviewAsync(Guid requestId, Guid reviewerId, ReviewLeaveRequestDto dto)
    {
        if (!Enum.TryParse<LeaveStatus>(dto.Action, out var action) ||
            action is not (LeaveStatus.Approved or LeaveStatus.Rejected))
            throw new ArgumentException("Action must be 'Approved' or 'Rejected'.");

        var request = await leaveRequestRepository.GetByIdAsync(requestId)
            ?? throw new KeyNotFoundException("Leave request not found.");

        if (request.Status != LeaveStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be reviewed.");

        var reviewer = await userRepository.GetByIdAsync(reviewerId)
            ?? throw new KeyNotFoundException("Reviewer not found.");

        if (reviewer.Role != UserRole.Admin && request.User.ManagerId != reviewerId)
            throw new UnauthorizedAccessException("You can only review requests from your direct reports.");

        request.Status = action;
        request.ManagerComment = dto.ManagerComment;
        request.ReviewedByUserId = reviewerId;

        if (action == LeaveStatus.Approved)
        {
            var balance = await leaveBalanceRepository.GetByUserAndTypeAsync(
                request.UserId, request.LeaveTypeId, request.StartDate.Year)
                ?? throw new InvalidOperationException("Leave balance record not found.");

            if (balance.RemainingDays < request.TotalDays)
                throw new InvalidOperationException("Insufficient balance to approve this request.");

            balance.UsedDays += request.TotalDays;
            await leaveBalanceRepository.UpdateAsync(balance);
        }

        var updated = await leaveRequestRepository.UpdateAsync(request);

        // Notify employee of decision
        var employee = request.User;
        _ = emailService.SendLeaveRequestReviewedAsync(
            employee.Email,
            $"{employee.FirstName} {employee.LastName}",
            request.LeaveType?.Name ?? string.Empty,
            action.ToString(),
            dto.ManagerComment);

        return MapToDto(updated);
    }

    public async Task CancelAsync(Guid requestId, Guid userId)
    {
        var request = await leaveRequestRepository.GetByIdAsync(requestId)
            ?? throw new KeyNotFoundException("Leave request not found.");

        if (request.UserId != userId)
            throw new UnauthorizedAccessException("You can only cancel your own requests.");

        if (request.Status == LeaveStatus.Approved)
        {
            var balance = await leaveBalanceRepository.GetByUserAndTypeAsync(
                request.UserId, request.LeaveTypeId, request.StartDate.Year);

            if (balance is not null)
            {
                balance.UsedDays = Math.Max(0, balance.UsedDays - request.TotalDays);
                await leaveBalanceRepository.UpdateAsync(balance);
            }
        }
        else if (request.Status != LeaveStatus.Pending)
        {
            throw new InvalidOperationException("Only pending or approved requests can be cancelled.");
        }

        request.Status = LeaveStatus.Rejected;
        request.ManagerComment = "Cancelled by employee.";
        await leaveRequestRepository.UpdateAsync(request);
    }

    private static LeaveRequestDto MapToDto(LeaveRequest r) => new()
    {
        Id = r.Id,
        UserId = r.UserId,
        EmployeeName = r.User is not null ? $"{r.User.FirstName} {r.User.LastName}" : string.Empty,
        LeaveTypeId = r.LeaveTypeId,
        LeaveTypeName = r.LeaveType?.Name ?? string.Empty,
        StartDate = r.StartDate,
        EndDate = r.EndDate,
        TotalDays = r.TotalDays,
        Status = r.Status.ToString(),
        EmployeeComment = r.EmployeeComment,
        ManagerComment = r.ManagerComment,
        ReviewedByName = r.ReviewedBy is not null ? $"{r.ReviewedBy.FirstName} {r.ReviewedBy.LastName}" : null,
        CreatedAt = r.CreatedAt
    };
}
