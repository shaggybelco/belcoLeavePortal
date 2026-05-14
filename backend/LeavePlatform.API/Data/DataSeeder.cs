using BCrypt.Net;
using LeavePlatform.API.Enums;
using LeavePlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Only seed if no users exist yet
        if (await db.Users.AnyAsync()) return;

        // ── Departments ──────────────────────────────────────────────────────
        var hrDept        = new Department { Id = Guid.NewGuid(), Name = "Human Resources" };
        var itDept        = new Department { Id = Guid.NewGuid(), Name = "Information Technology" };
        var financeDept   = new Department { Id = Guid.NewGuid(), Name = "Finance" };
        var operationsDept = new Department { Id = Guid.NewGuid(), Name = "Operations" };

        db.Departments.AddRange(hrDept, itDept, financeDept, operationsDept);

        // ── Leave Types ───────────────────────────────────────────────────────
        var annual   = new LeaveType { Id = Guid.NewGuid(), Name = "Annual Leave",    DefaultDays = 21 };
        var sick     = new LeaveType { Id = Guid.NewGuid(), Name = "Sick Leave",       DefaultDays = 10 };
        var family   = new LeaveType { Id = Guid.NewGuid(), Name = "Family Responsibility", DefaultDays = 3 };
        var study    = new LeaveType { Id = Guid.NewGuid(), Name = "Study Leave",      DefaultDays = 5 };

        db.LeaveTypes.AddRange(annual, sick, family, study);

        // ── Users ─────────────────────────────────────────────────────────────
        var adminUser = new User
        {
            Id           = Guid.NewGuid(),
            FirstName    = "Admin",
            LastName     = "Belco",
            Email        = "admin@belco.co.za",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"),
            Role         = UserRole.Admin,
            DepartmentId = hrDept.Id
        };

        var hrManager = new User
        {
            Id           = Guid.NewGuid(),
            FirstName    = "Sarah",
            LastName     = "Dlamini",
            Email        = "sarah.dlamini@belco.co.za",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@1234"),
            Role         = UserRole.Manager,
            DepartmentId = hrDept.Id
        };

        var itManager = new User
        {
            Id           = Guid.NewGuid(),
            FirstName    = "Thabo",
            LastName     = "Nkosi",
            Email        = "thabo.nkosi@belco.co.za",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@1234"),
            Role         = UserRole.Manager,
            DepartmentId = itDept.Id
        };

        var emp1 = new User
        {
            Id           = Guid.NewGuid(),
            FirstName    = "Lebo",
            LastName     = "Mokoena",
            Email        = "lebo.mokoena@belco.co.za",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employee@1234"),
            Role         = UserRole.Employee,
            DepartmentId = itDept.Id,
            ManagerId    = itManager.Id
        };

        var emp2 = new User
        {
            Id           = Guid.NewGuid(),
            FirstName    = "Zanele",
            LastName     = "Sithole",
            Email        = "zanele.sithole@belco.co.za",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employee@1234"),
            Role         = UserRole.Employee,
            DepartmentId = financeDept.Id,
            ManagerId    = hrManager.Id
        };

        var emp3 = new User
        {
            Id           = Guid.NewGuid(),
            FirstName    = "Sipho",
            LastName     = "Khoza",
            Email        = "sipho.khoza@belco.co.za",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employee@1234"),
            Role         = UserRole.Employee,
            DepartmentId = operationsDept.Id,
            ManagerId    = hrManager.Id
        };

        db.Users.AddRange(adminUser, hrManager, itManager, emp1, emp2, emp3);

        // ── Leave Balances (current year) ────────────────────────────────────
        var year = DateTime.UtcNow.Year;
        var leaveTypes = new[] { annual, sick, family, study };
        var allEmployees = new[] { adminUser, hrManager, itManager, emp1, emp2, emp3 };

        foreach (var user in allEmployees)
        {
            foreach (var lt in leaveTypes)
            {
                db.LeaveBalances.Add(new LeaveBalance
                {
                    Id          = Guid.NewGuid(),
                    UserId      = user.Id,
                    LeaveTypeId = lt.Id,
                    Year        = year,
                    TotalDays   = lt.DefaultDays,
                    UsedDays    = 0
                });
            }
        }

        await db.SaveChangesAsync();
    }
}
