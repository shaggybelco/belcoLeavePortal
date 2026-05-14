using System.Security.Claims;
using LeavePlatform.API.DTOs.LeaveRequest;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeavePlatform.API.Controllers;

[ApiController]
[Route("api/leave-requests")]
[Authorize]
public class LeaveRequestsController(ILeaveRequestService leaveRequestService) : ControllerBase
{
    private Guid CurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(sub!);
    }

    // Employee: view own requests
    [HttpGet("my")]
    public async Task<IActionResult> GetMine() =>
        Ok(await leaveRequestService.GetMyRequestsAsync(CurrentUserId()));

    // Manager: view direct reports' requests
    [HttpGet("team")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<IActionResult> GetTeam() =>
        Ok(await leaveRequestService.GetTeamRequestsAsync(CurrentUserId()));

    // Admin: view all requests
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll() =>
        Ok(await leaveRequestService.GetAllAsync());

    // Employee: apply for leave
    [HttpPost]
    public async Task<IActionResult> Create(CreateLeaveRequestDto dto)
    {
        try
        {
            var result = await leaveRequestService.CreateAsync(CurrentUserId(), dto);
            return CreatedAtAction(nameof(GetMine), result);
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    // Manager/Admin: approve or reject
    [HttpPut("{id}/review")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<IActionResult> Review(Guid id, ReviewLeaveRequestDto dto)
    {
        try { return Ok(await leaveRequestService.ReviewAsync(id, CurrentUserId(), dto)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
    }

    // Employee: cancel own request
    [HttpDelete("{id}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try { await leaveRequestService.CancelAsync(id, CurrentUserId()); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }
}
