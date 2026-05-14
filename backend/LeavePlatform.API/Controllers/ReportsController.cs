using LeavePlatform.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeavePlatform.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin")]
public class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpGet("leave-summary")]
    public async Task<IActionResult> LeaveSummary([FromQuery] int? year) =>
        Ok(await reportService.GetLeaveSummaryAsync(year ?? DateTime.UtcNow.Year));

    [HttpGet("audit-logs")]
    public async Task<IActionResult> AuditLogs([FromQuery] int count = 100) =>
        Ok(await reportService.GetAuditLogsAsync(count));
}
