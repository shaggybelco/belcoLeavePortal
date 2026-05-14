using System.Security.Claims;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeavePlatform.API.Controllers;

[ApiController]
[Route("api/leave-balances")]
[Authorize]
public class LeaveBalancesController(ILeaveBalanceService leaveBalanceService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMyBalances([FromQuery] int? year, [FromQuery] Guid? userId)
    {
        var requestedYear = year ?? DateTime.UtcNow.Year;

        // Admins can query any user; everyone else can only see their own
        Guid targetUserId;
        if (userId.HasValue && User.IsInRole("Admin"))
        {
            targetUserId = userId.Value;
        }
        else
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(sub, out targetUserId))
                return Unauthorized();
        }

        return Ok(await leaveBalanceService.GetByUserAsync(targetUserId, requestedYear));
    }
}
