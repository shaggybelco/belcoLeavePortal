# Leave Management System — Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully working ASP.NET Core 8 Web API with JWT auth, role-based access, EF Core + PostgreSQL, layered architecture, and Resend email notifications — containerized with Docker and ready to deploy to Render.

**Architecture:** Layered architecture — Controllers receive HTTP requests and delegate to Services which contain business logic, Services call Repositories which talk to EF Core, EF Core maps to Neon PostgreSQL. Each layer only knows about the layer directly below it.

**Tech Stack:** .NET 8, ASP.NET Core Web API, Entity Framework Core 8, Npgsql (PostgreSQL provider), BCrypt.Net-Next, Microsoft.AspNetCore.Authentication.JwtBearer, Resend .NET SDK, xUnit, Moq, FluentAssertions, Docker

---

## File Map

```
belcoLeavePortal/
├── backend/
│   ├── LeavePlatform.sln
│   ├── LeavePlatform.API/
│   │   ├── Program.cs
│   │   ├── LeavePlatform.API.csproj
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   ├── Dockerfile
│   │   ├── Data/
│   │   │   └── AppDbContext.cs
│   │   ├── Models/
│   │   │   ├── User.cs
│   │   │   ├── Department.cs
│   │   │   ├── LeaveType.cs
│   │   │   ├── LeaveBalance.cs
│   │   │   ├── LeaveRequest.cs
│   │   │   └── AuditLog.cs
│   │   ├── Enums/
│   │   │   ├── UserRole.cs
│   │   │   └── LeaveStatus.cs
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   │   ├── RegisterDto.cs
│   │   │   │   ├── LoginDto.cs
│   │   │   │   └── AuthResponseDto.cs
│   │   │   ├── Department/
│   │   │   │   ├── CreateDepartmentDto.cs
│   │   │   │   └── DepartmentDto.cs
│   │   │   ├── LeaveType/
│   │   │   │   ├── CreateLeaveTypeDto.cs
│   │   │   │   ├── UpdateLeaveTypeDto.cs
│   │   │   │   └── LeaveTypeDto.cs
│   │   │   ├── User/
│   │   │   │   ├── CreateUserDto.cs
│   │   │   │   ├── UpdateUserDto.cs
│   │   │   │   └── UserDto.cs
│   │   │   ├── LeaveRequest/
│   │   │   │   ├── CreateLeaveRequestDto.cs
│   │   │   │   ├── ReviewLeaveRequestDto.cs
│   │   │   │   └── LeaveRequestDto.cs
│   │   │   └── LeaveBalance/
│   │   │       └── LeaveBalanceDto.cs
│   │   ├── Repositories/
│   │   │   ├── Interfaces/
│   │   │   │   ├── IUserRepository.cs
│   │   │   │   ├── IDepartmentRepository.cs
│   │   │   │   ├── ILeaveTypeRepository.cs
│   │   │   │   ├── ILeaveRequestRepository.cs
│   │   │   │   ├── ILeaveBalanceRepository.cs
│   │   │   │   └── IAuditLogRepository.cs
│   │   │   ├── UserRepository.cs
│   │   │   ├── DepartmentRepository.cs
│   │   │   ├── LeaveTypeRepository.cs
│   │   │   ├── LeaveRequestRepository.cs
│   │   │   ├── LeaveBalanceRepository.cs
│   │   │   └── AuditLogRepository.cs
│   │   ├── Services/
│   │   │   ├── Interfaces/
│   │   │   │   ├── IAuthService.cs
│   │   │   │   ├── IDepartmentService.cs
│   │   │   │   ├── ILeaveTypeService.cs
│   │   │   │   ├── IUserService.cs
│   │   │   │   ├── ILeaveRequestService.cs
│   │   │   │   ├── ILeaveBalanceService.cs
│   │   │   │   └── IEmailService.cs
│   │   │   ├── AuthService.cs
│   │   │   ├── DepartmentService.cs
│   │   │   ├── LeaveTypeService.cs
│   │   │   ├── UserService.cs
│   │   │   ├── LeaveRequestService.cs
│   │   │   ├── LeaveBalanceService.cs
│   │   │   └── EmailService.cs
│   │   └── Controllers/
│   │       ├── AuthController.cs
│   │       ├── DepartmentsController.cs
│   │       ├── LeaveTypesController.cs
│   │       ├── UsersController.cs
│   │       ├── LeaveRequestsController.cs
│   │       ├── LeaveBalancesController.cs
│   │       └── ReportsController.cs
│   └── LeavePlatform.Tests/
│       ├── LeavePlatform.Tests.csproj
│       └── Services/
│           ├── AuthServiceTests.cs
│           ├── LeaveRequestServiceTests.cs
│           └── LeaveBalanceServiceTests.cs
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Task 1: Repository Structure & .NET Solution Setup

**Files:**
- Create: `backend/LeavePlatform.sln`
- Create: `backend/LeavePlatform.API/LeavePlatform.API.csproj`
- Create: `backend/LeavePlatform.Tests/LeavePlatform.Tests.csproj`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Create the solution and projects**

Run these commands from the repo root:

```bash
mkdir backend
cd backend
dotnet new sln -n LeavePlatform
dotnet new webapi -n LeavePlatform.API --framework net8.0
dotnet new xunit -n LeavePlatform.Tests --framework net8.0
dotnet sln add LeavePlatform.API/LeavePlatform.API.csproj
dotnet sln add LeavePlatform.Tests/LeavePlatform.Tests.csproj
```

- [ ] **Step 2: Add NuGet packages to the API project**

```bash
cd LeavePlatform.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.*
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.*
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.*
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.*
dotnet add package BCrypt.Net-Next --version 4.0.3
dotnet add package Resend --version 0.8.*
```

- [ ] **Step 3: Add NuGet packages to the Tests project**

```bash
cd ../LeavePlatform.Tests
dotnet add package Moq --version 4.20.*
dotnet add package FluentAssertions --version 6.12.*
dotnet add package Microsoft.EntityFrameworkCore.InMemory --version 8.0.*
dotnet add reference ../LeavePlatform.API/LeavePlatform.API.csproj
```

- [ ] **Step 4: Create `docker-compose.yml` at the repo root**

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: leaveplatform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: ./backend/LeavePlatform.API
      dockerfile: Dockerfile
    ports:
      - "5000:8080"
    environment:
      - ConnectionStrings__DefaultConnection=Host=db;Database=leaveplatform;Username=postgres;Password=postgres
      - Jwt__Key=your-local-dev-secret-key-min-32-chars!!
      - Jwt__Issuer=LeavePlatform
      - Jwt__Audience=LeavePlatformUsers
      - Resend__ApiKey=re_local_placeholder
    depends_on:
      - db

volumes:
  postgres_data:
```

- [ ] **Step 5: Create `.env.example` at the repo root**

```
# Copy this to .env and fill in real values (never commit .env)

# Database
ConnectionStrings__DefaultConnection=Host=localhost;Database=leaveplatform;Username=postgres;Password=postgres

# JWT
Jwt__Key=your-secret-key-must-be-at-least-32-characters-long
Jwt__Issuer=LeavePlatform
Jwt__Audience=LeavePlatformUsers

# Resend
Resend__ApiKey=re_xxxxxxxxxxxx

# Frontend URL (for CORS)
AllowedOrigins=http://localhost:4200
```

- [ ] **Step 6: Create `.gitignore` at the repo root**

```
# .NET
backend/**/bin/
backend/**/obj/
backend/**/*.user
backend/**/.vs/
backend/**/appsettings.Development.json

# Environment
.env
*.env.local

# Angular (added in Plan 2)
frontend/**/node_modules/
frontend/**/.angular/
frontend/**/dist/

# Docker
.docker/
```

- [ ] **Step 7: Verify the solution builds**

```bash
cd backend
dotnet build
```

Expected output: `Build succeeded. 0 Warning(s). 0 Error(s)`

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: scaffold .NET solution, API and test projects"
```

---

## Task 2: Enums & Domain Models

**Files:**
- Create: `backend/LeavePlatform.API/Enums/UserRole.cs`
- Create: `backend/LeavePlatform.API/Enums/LeaveStatus.cs`
- Create: `backend/LeavePlatform.API/Models/Department.cs`
- Create: `backend/LeavePlatform.API/Models/User.cs`
- Create: `backend/LeavePlatform.API/Models/LeaveType.cs`
- Create: `backend/LeavePlatform.API/Models/LeaveBalance.cs`
- Create: `backend/LeavePlatform.API/Models/LeaveRequest.cs`
- Create: `backend/LeavePlatform.API/Models/AuditLog.cs`

- [ ] **Step 1: Create `Enums/UserRole.cs`**

```csharp
namespace LeavePlatform.API.Enums;

public enum UserRole
{
    Employee,
    Manager,
    Admin
}
```

- [ ] **Step 2: Create `Enums/LeaveStatus.cs`**

```csharp
namespace LeavePlatform.API.Enums;

public enum LeaveStatus
{
    Pending,
    Approved,
    Rejected
}
```

- [ ] **Step 3: Create `Models/Department.cs`**

```csharp
namespace LeavePlatform.API.Models;

public class Department
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }

    public ICollection<User> Users { get; set; } = [];
}
```

- [ ] **Step 4: Create `Models/User.cs`**

```csharp
using LeavePlatform.API.Enums;

namespace LeavePlatform.API.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.Employee;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public Guid? ManagerId { get; set; }
    public User? Manager { get; set; }

    public ICollection<User> DirectReports { get; set; } = [];
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = [];
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = [];
}
```

- [ ] **Step 5: Create `Models/LeaveType.cs`**

```csharp
namespace LeavePlatform.API.Models;

public class LeaveType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public int DefaultDays { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<LeaveBalance> LeaveBalances { get; set; } = [];
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = [];
}
```

- [ ] **Step 6: Create `Models/LeaveBalance.cs`**

```csharp
namespace LeavePlatform.API.Models;

public class LeaveBalance
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid LeaveTypeId { get; set; }
    public LeaveType LeaveType { get; set; } = null!;
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }

    public int RemainingDays => TotalDays - UsedDays;
}
```

- [ ] **Step 7: Create `Models/LeaveRequest.cs`**

```csharp
using LeavePlatform.API.Enums;

namespace LeavePlatform.API.Models;

public class LeaveRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid LeaveTypeId { get; set; }
    public LeaveType LeaveType { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }
    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;
    public string? EmployeeComment { get; set; }
    public string? ManagerComment { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public User? ReviewedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

- [ ] **Step 8: Create `Models/AuditLog.cs`**

```csharp
namespace LeavePlatform.API.Models;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public required string Action { get; set; }
    public required string EntityType { get; set; }
    public required string EntityId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

- [ ] **Step 9: Verify the project still builds**

```bash
cd backend
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s)`

- [ ] **Step 10: Commit**

```bash
git add backend/LeavePlatform.API/Models/ backend/LeavePlatform.API/Enums/
git commit -m "feat: add domain models and enums"
```

---

## Task 3: AppDbContext & Database Migration

**Files:**
- Create: `backend/LeavePlatform.API/Data/AppDbContext.cs`
- Modify: `backend/LeavePlatform.API/appsettings.json`
- Create: `backend/LeavePlatform.API/appsettings.Development.json`
- Modify: `backend/LeavePlatform.API/Program.cs`

- [ ] **Step 1: Create `Data/AppDbContext.cs`**

```csharp
using LeavePlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Unique email constraint
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Store enums as strings (readable in the database)
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<LeaveRequest>()
            .Property(r => r.Status)
            .HasConversion<string>();

        // Self-referencing relationship: User -> Manager (also a User)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Manager)
            .WithMany(u => u.DirectReports)
            .HasForeignKey(u => u.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // LeaveRequest -> ReviewedBy (also a User)
        modelBuilder.Entity<LeaveRequest>()
            .HasOne(r => r.ReviewedBy)
            .WithMany()
            .HasForeignKey(r => r.ReviewedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // One LeaveBalance row per user per leave type per year
        modelBuilder.Entity<LeaveBalance>()
            .HasIndex(b => new { b.UserId, b.LeaveTypeId, b.Year })
            .IsUnique();
    }
}
```

- [ ] **Step 2: Update `appsettings.json`**

Replace the default content with:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "Jwt": {
    "Key": "",
    "Issuer": "LeavePlatform",
    "Audience": "LeavePlatformUsers",
    "ExpiryHours": 24
  },
  "Resend": {
    "ApiKey": "",
    "FromEmail": "noreply@yourdomain.com"
  },
  "AllowedOrigins": "",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

- [ ] **Step 3: Create `appsettings.Development.json`**

This file is gitignored — it holds your local secrets:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=leaveplatform;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Key": "local-dev-secret-key-must-be-at-least-32-characters-long!!"
  },
  "Resend": {
    "ApiKey": "re_placeholder"
  },
  "AllowedOrigins": "http://localhost:4200"
}
```

- [ ] **Step 4: Update `Program.cs` to register AppDbContext**

Replace the default `Program.cs` with:

```csharp
using LeavePlatform.API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

- [ ] **Step 5: Create the initial migration**

Run from the `LeavePlatform.API` directory:

```bash
dotnet ef migrations add InitialCreate --output-dir Data/Migrations
```

Expected: `Build succeeded.` followed by `Done. To undo this action, use 'ef migrations remove'`

- [ ] **Step 6: Start local PostgreSQL and apply the migration**

From the repo root:

```bash
docker compose up db -d
cd backend/LeavePlatform.API
dotnet ef database update
```

Expected: `Done.` — tables now exist in your local PostgreSQL.

- [ ] **Step 7: Verify by running the API**

```bash
dotnet run
```

Open `https://localhost:5001/swagger` in your browser. You should see the Swagger UI (empty for now). Press Ctrl+C to stop.

- [ ] **Step 8: Commit**

```bash
git add backend/LeavePlatform.API/Data/ backend/LeavePlatform.API/Program.cs backend/LeavePlatform.API/appsettings.json
git commit -m "feat: add AppDbContext, EF Core migrations, PostgreSQL connection"
```

---

## Task 4: Auth — Register & Login with JWT

**Files:**
- Create: `backend/LeavePlatform.API/DTOs/Auth/RegisterDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/Auth/LoginDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/Auth/AuthResponseDto.cs`
- Create: `backend/LeavePlatform.API/Repositories/Interfaces/IUserRepository.cs`
- Create: `backend/LeavePlatform.API/Repositories/UserRepository.cs`
- Create: `backend/LeavePlatform.API/Services/Interfaces/IAuthService.cs`
- Create: `backend/LeavePlatform.API/Services/AuthService.cs`
- Create: `backend/LeavePlatform.API/Controllers/AuthController.cs`
- Create: `backend/LeavePlatform.Tests/Services/AuthServiceTests.cs`
- Modify: `backend/LeavePlatform.API/Program.cs`

- [ ] **Step 1: Write the failing test first**

Create `backend/LeavePlatform.Tests/Services/AuthServiceTests.cs`:

```csharp
using FluentAssertions;
using LeavePlatform.API.DTOs.Auth;
using LeavePlatform.API.Enums;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace LeavePlatform.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly IConfiguration _config;

    public AuthServiceTests()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "test-secret-key-must-be-at-least-32-characters-long!!",
            ["Jwt:Issuer"] = "LeavePlatform",
            ["Jwt:Audience"] = "LeavePlatformUsers",
            ["Jwt:ExpiryHours"] = "24"
        };
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ReturnsTokenAndUserInfo()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetByEmailAsync("john@example.com"))
            .ReturnsAsync((User?)null);

        _userRepoMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => u);

        var service = new AuthService(_userRepoMock.Object, _config);
        var dto = new RegisterDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Password = "Password123!"
        };

        // Act
        var result = await service.RegisterAsync(dto);

        // Assert
        result.Token.Should().NotBeNullOrEmpty();
        result.Email.Should().Be("john@example.com");
        result.Role.Should().Be(UserRole.Employee.ToString());
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetByEmailAsync("existing@example.com"))
            .ReturnsAsync(new User
            {
                FirstName = "Existing",
                LastName = "User",
                Email = "existing@example.com",
                PasswordHash = "hash"
            });

        var service = new AuthService(_userRepoMock.Object, _config);
        var dto = new RegisterDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "existing@example.com",
            Password = "Password123!"
        };

        // Act & Assert
        await service.Invoking(s => s.RegisterAsync(dto))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already registered*");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("Password123!");
        _userRepoMock.Setup(r => r.GetByEmailAsync("john@example.com"))
            .ReturnsAsync(new User
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                PasswordHash = hashedPassword,
                Role = UserRole.Employee
            });

        var service = new AuthService(_userRepoMock.Object, _config);
        var dto = new LoginDto { Email = "john@example.com", Password = "Password123!" };

        // Act
        var result = await service.LoginAsync(dto);

        // Assert
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("CorrectPassword!");
        _userRepoMock.Setup(r => r.GetByEmailAsync("john@example.com"))
            .ReturnsAsync(new User
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                PasswordHash = hashedPassword
            });

        var service = new AuthService(_userRepoMock.Object, _config);
        var dto = new LoginDto { Email = "john@example.com", Password = "WrongPassword!" };

        // Act & Assert
        await service.Invoking(s => s.LoginAsync(dto))
            .Should().ThrowAsync<UnauthorizedAccessException>();
    }
}
```

- [ ] **Step 2: Run the test to confirm it fails (compile error — types don't exist yet)**

```bash
cd backend
dotnet test LeavePlatform.Tests --no-build 2>&1 | head -30
```

Expected: Build errors about missing types. That's correct — we write the implementation next.

- [ ] **Step 3: Create `DTOs/Auth/RegisterDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.Auth;

public class RegisterDto
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
}
```

- [ ] **Step 4: Create `DTOs/Auth/LoginDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.Auth;

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
```

- [ ] **Step 5: Create `DTOs/Auth/AuthResponseDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.Auth;

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public required string Role { get; set; }
    public Guid UserId { get; set; }
}
```

- [ ] **Step 6: Create `Repositories/Interfaces/IUserRepository.cs`**

```csharp
using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task<IEnumerable<User>> GetByManagerIdAsync(Guid managerId);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
}
```

- [ ] **Step 7: Create `Repositories/UserRepository.cs`**

```csharp
using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<User?> GetByIdAsync(Guid id) =>
        await context.Users.Include(u => u.Department).FirstOrDefaultAsync(u => u.Id == id);

    public async Task<User?> GetByEmailAsync(string email) =>
        await context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower());

    public async Task<IEnumerable<User>> GetAllAsync() =>
        await context.Users.Include(u => u.Department).Where(u => u.IsActive).ToListAsync();

    public async Task<IEnumerable<User>> GetByManagerIdAsync(Guid managerId) =>
        await context.Users.Where(u => u.ManagerId == managerId && u.IsActive).ToListAsync();

    public async Task<User> CreateAsync(User user)
    {
        user.Email = user.Email.ToLower();
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        context.Users.Update(user);
        await context.SaveChangesAsync();
        return user;
    }
}
```

- [ ] **Step 8: Create `Services/Interfaces/IAuthService.cs`**

```csharp
using LeavePlatform.API.DTOs.Auth;

namespace LeavePlatform.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
```

- [ ] **Step 9: Create `Services/AuthService.cs`**

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LeavePlatform.API.DTOs.Auth;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace LeavePlatform.API.Services;

public class AuthService(IUserRepository userRepository, IConfiguration config) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await userRepository.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException("Email is already registered.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        var created = await userRepository.CreateAsync(user);
        return BuildResponse(created);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await userRepository.GetByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        return BuildResponse(user);
    }

    private AuthResponseDto BuildResponse(User user) => new()
    {
        Token = GenerateToken(user),
        Email = user.Email,
        FullName = $"{user.FirstName} {user.LastName}",
        Role = user.Role.ToString(),
        UserId = user.Id
    };

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddHours(int.Parse(config["Jwt:ExpiryHours"] ?? "24"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(ClaimTypes.GivenName, user.FirstName)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

- [ ] **Step 10: Create `Controllers/AuthController.cs`**

```csharp
using LeavePlatform.API.DTOs.Auth;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LeavePlatform.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            var result = await authService.RegisterAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        try
        {
            var result = await authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
```

- [ ] **Step 11: Update `Program.cs` to wire up JWT auth, CORS, and register services**

```csharp
using System.Text;
using LeavePlatform.API.Data;
using LeavePlatform.API.Repositories;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// CORS
var allowedOrigins = builder.Configuration["AllowedOrigins"] ?? "http://localhost:4200";
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(allowedOrigins.Split(','))
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

- [ ] **Step 12: Run the tests**

```bash
cd backend
dotnet test LeavePlatform.Tests -v normal
```

Expected: All 4 tests pass. `Passed! - Failed: 0, Passed: 4`

- [ ] **Step 13: Run the API and test register via Swagger**

```bash
cd LeavePlatform.API
dotnet run
```

Open `http://localhost:5000/swagger`, use `POST /api/auth/register` with:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

Expected: 200 OK with a token in the response.

- [ ] **Step 14: Commit**

```bash
git add backend/
git commit -m "feat: add JWT auth with register and login endpoints"
```

---

## Task 5: Departments CRUD (Admin)

**Files:**
- Create: `backend/LeavePlatform.API/DTOs/Department/DepartmentDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/Department/CreateDepartmentDto.cs`
- Create: `backend/LeavePlatform.API/Repositories/Interfaces/IDepartmentRepository.cs`
- Create: `backend/LeavePlatform.API/Repositories/DepartmentRepository.cs`
- Create: `backend/LeavePlatform.API/Services/Interfaces/IDepartmentService.cs`
- Create: `backend/LeavePlatform.API/Services/DepartmentService.cs`
- Create: `backend/LeavePlatform.API/Controllers/DepartmentsController.cs`
- Modify: `backend/LeavePlatform.API/Program.cs`

- [ ] **Step 1: Create `DTOs/Department/DepartmentDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.Department;

public class DepartmentDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int UserCount { get; set; }
}
```

- [ ] **Step 2: Create `DTOs/Department/CreateDepartmentDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.Department;

public class CreateDepartmentDto
{
    public required string Name { get; set; }
}
```

- [ ] **Step 3: Create `Repositories/Interfaces/IDepartmentRepository.cs`**

```csharp
using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface IDepartmentRepository
{
    Task<IEnumerable<Department>> GetAllAsync();
    Task<Department?> GetByIdAsync(Guid id);
    Task<Department> CreateAsync(Department department);
    Task<Department> UpdateAsync(Department department);
}
```

- [ ] **Step 4: Create `Repositories/DepartmentRepository.cs`**

```csharp
using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class DepartmentRepository(AppDbContext context) : IDepartmentRepository
{
    public async Task<IEnumerable<Department>> GetAllAsync() =>
        await context.Departments.Include(d => d.Users).ToListAsync();

    public async Task<Department?> GetByIdAsync(Guid id) =>
        await context.Departments.Include(d => d.Users).FirstOrDefaultAsync(d => d.Id == id);

    public async Task<Department> CreateAsync(Department department)
    {
        context.Departments.Add(department);
        await context.SaveChangesAsync();
        return department;
    }

    public async Task<Department> UpdateAsync(Department department)
    {
        context.Departments.Update(department);
        await context.SaveChangesAsync();
        return department;
    }
}
```

- [ ] **Step 5: Create `Services/Interfaces/IDepartmentService.cs`**

```csharp
using LeavePlatform.API.DTOs.Department;

namespace LeavePlatform.API.Services.Interfaces;

public interface IDepartmentService
{
    Task<IEnumerable<DepartmentDto>> GetAllAsync();
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto);
    Task<DepartmentDto> UpdateAsync(Guid id, CreateDepartmentDto dto);
}
```

- [ ] **Step 6: Create `Services/DepartmentService.cs`**

```csharp
using LeavePlatform.API.DTOs.Department;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class DepartmentService(IDepartmentRepository departmentRepository) : IDepartmentService
{
    public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
    {
        var departments = await departmentRepository.GetAllAsync();
        return departments.Select(d => new DepartmentDto
        {
            Id = d.Id,
            Name = d.Name,
            UserCount = d.Users.Count(u => u.IsActive)
        });
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto)
    {
        var department = new Department { Name = dto.Name };
        var created = await departmentRepository.CreateAsync(department);
        return new DepartmentDto { Id = created.Id, Name = created.Name, UserCount = 0 };
    }

    public async Task<DepartmentDto> UpdateAsync(Guid id, CreateDepartmentDto dto)
    {
        var department = await departmentRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Department not found.");

        department.Name = dto.Name;
        var updated = await departmentRepository.UpdateAsync(department);
        return new DepartmentDto
        {
            Id = updated.Id,
            Name = updated.Name,
            UserCount = updated.Users.Count(u => u.IsActive)
        };
    }
}
```

- [ ] **Step 7: Create `Controllers/DepartmentsController.cs`**

```csharp
using LeavePlatform.API.DTOs.Department;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeavePlatform.API.Controllers;

[ApiController]
[Route("api/departments")]
[Authorize]
public class DepartmentsController(IDepartmentService departmentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await departmentService.GetAllAsync());

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateDepartmentDto dto)
    {
        var result = await departmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, CreateDepartmentDto dto)
    {
        try
        {
            var result = await departmentService.UpdateAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
```

- [ ] **Step 8: Register in `Program.cs`** — add these lines before `var app = builder.Build();`

```csharp
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
```

- [ ] **Step 9: Build and test via Swagger**

```bash
dotnet build
dotnet run
```

Use Swagger to `POST /api/departments` (you'll get 401 until you add a JWT token via the Authorize button in Swagger — use the token from the login endpoint).

- [ ] **Step 10: Commit**

```bash
git add backend/
git commit -m "feat: add departments CRUD endpoints (admin only)"
```

---

## Task 6: Leave Types CRUD (Admin)

**Files:**
- Create: `backend/LeavePlatform.API/DTOs/LeaveType/LeaveTypeDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/LeaveType/CreateLeaveTypeDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/LeaveType/UpdateLeaveTypeDto.cs`
- Create: `backend/LeavePlatform.API/Repositories/Interfaces/ILeaveTypeRepository.cs`
- Create: `backend/LeavePlatform.API/Repositories/LeaveTypeRepository.cs`
- Create: `backend/LeavePlatform.API/Services/Interfaces/ILeaveTypeService.cs`
- Create: `backend/LeavePlatform.API/Services/LeaveTypeService.cs`
- Create: `backend/LeavePlatform.API/Controllers/LeaveTypesController.cs`
- Modify: `backend/LeavePlatform.API/Program.cs`

- [ ] **Step 1: Create `DTOs/LeaveType/LeaveTypeDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.LeaveType;

public class LeaveTypeDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int DefaultDays { get; set; }
    public bool IsActive { get; set; }
}
```

- [ ] **Step 2: Create `DTOs/LeaveType/CreateLeaveTypeDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.LeaveType;

public class CreateLeaveTypeDto
{
    public required string Name { get; set; }
    public int DefaultDays { get; set; }
}
```

- [ ] **Step 3: Create `DTOs/LeaveType/UpdateLeaveTypeDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.LeaveType;

public class UpdateLeaveTypeDto
{
    public required string Name { get; set; }
    public int DefaultDays { get; set; }
    public bool IsActive { get; set; }
}
```

- [ ] **Step 4: Create `Repositories/Interfaces/ILeaveTypeRepository.cs`**

```csharp
using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface ILeaveTypeRepository
{
    Task<IEnumerable<LeaveType>> GetAllAsync(bool activeOnly = true);
    Task<LeaveType?> GetByIdAsync(Guid id);
    Task<LeaveType> CreateAsync(LeaveType leaveType);
    Task<LeaveType> UpdateAsync(LeaveType leaveType);
}
```

- [ ] **Step 5: Create `Repositories/LeaveTypeRepository.cs`**

```csharp
using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class LeaveTypeRepository(AppDbContext context) : ILeaveTypeRepository
{
    public async Task<IEnumerable<LeaveType>> GetAllAsync(bool activeOnly = true)
    {
        var query = context.LeaveTypes.AsQueryable();
        if (activeOnly) query = query.Where(lt => lt.IsActive);
        return await query.ToListAsync();
    }

    public async Task<LeaveType?> GetByIdAsync(Guid id) =>
        await context.LeaveTypes.FirstOrDefaultAsync(lt => lt.Id == id);

    public async Task<LeaveType> CreateAsync(LeaveType leaveType)
    {
        context.LeaveTypes.Add(leaveType);
        await context.SaveChangesAsync();
        return leaveType;
    }

    public async Task<LeaveType> UpdateAsync(LeaveType leaveType)
    {
        context.LeaveTypes.Update(leaveType);
        await context.SaveChangesAsync();
        return leaveType;
    }
}
```

- [ ] **Step 6: Create `Services/Interfaces/ILeaveTypeService.cs`**

```csharp
using LeavePlatform.API.DTOs.LeaveType;

namespace LeavePlatform.API.Services.Interfaces;

public interface ILeaveTypeService
{
    Task<IEnumerable<LeaveTypeDto>> GetAllAsync();
    Task<LeaveTypeDto> CreateAsync(CreateLeaveTypeDto dto);
    Task<LeaveTypeDto> UpdateAsync(Guid id, UpdateLeaveTypeDto dto);
    Task DeactivateAsync(Guid id);
}
```

- [ ] **Step 7: Create `Services/LeaveTypeService.cs`**

```csharp
using LeavePlatform.API.DTOs.LeaveType;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class LeaveTypeService(ILeaveTypeRepository leaveTypeRepository) : ILeaveTypeService
{
    public async Task<IEnumerable<LeaveTypeDto>> GetAllAsync()
    {
        var types = await leaveTypeRepository.GetAllAsync();
        return types.Select(MapToDto);
    }

    public async Task<LeaveTypeDto> CreateAsync(CreateLeaveTypeDto dto)
    {
        var leaveType = new LeaveType { Name = dto.Name, DefaultDays = dto.DefaultDays };
        var created = await leaveTypeRepository.CreateAsync(leaveType);
        return MapToDto(created);
    }

    public async Task<LeaveTypeDto> UpdateAsync(Guid id, UpdateLeaveTypeDto dto)
    {
        var leaveType = await leaveTypeRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Leave type not found.");

        leaveType.Name = dto.Name;
        leaveType.DefaultDays = dto.DefaultDays;
        leaveType.IsActive = dto.IsActive;

        var updated = await leaveTypeRepository.UpdateAsync(leaveType);
        return MapToDto(updated);
    }

    public async Task DeactivateAsync(Guid id)
    {
        var leaveType = await leaveTypeRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Leave type not found.");

        leaveType.IsActive = false;
        await leaveTypeRepository.UpdateAsync(leaveType);
    }

    private static LeaveTypeDto MapToDto(LeaveType lt) => new()
    {
        Id = lt.Id,
        Name = lt.Name,
        DefaultDays = lt.DefaultDays,
        IsActive = lt.IsActive
    };
}
```

- [ ] **Step 8: Create `Controllers/LeaveTypesController.cs`**

```csharp
using LeavePlatform.API.DTOs.LeaveType;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeavePlatform.API.Controllers;

[ApiController]
[Route("api/leave-types")]
[Authorize]
public class LeaveTypesController(ILeaveTypeService leaveTypeService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await leaveTypeService.GetAllAsync());

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateLeaveTypeDto dto)
    {
        var result = await leaveTypeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, UpdateLeaveTypeDto dto)
    {
        try
        {
            return Ok(await leaveTypeService.UpdateAsync(id, dto));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        try
        {
            await leaveTypeService.DeactivateAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
```

- [ ] **Step 9: Register in `Program.cs`** — add these lines before `var app = builder.Build();`

```csharp
builder.Services.AddScoped<ILeaveTypeRepository, LeaveTypeRepository>();
builder.Services.AddScoped<ILeaveTypeService, LeaveTypeService>();
```

- [ ] **Step 10: Build, run, and test via Swagger**

```bash
dotnet build && dotnet run
```

Test `POST /api/leave-types` with `{"name": "Annual", "defaultDays": 21}`. Expect 201 Created.

- [ ] **Step 11: Commit**

```bash
git add backend/
git commit -m "feat: add leave types CRUD endpoints (admin only)"
```

---

## Task 7: User Management (Admin)

**Files:**
- Create: `backend/LeavePlatform.API/DTOs/User/UserDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/User/CreateUserDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/User/UpdateUserDto.cs`
- Create: `backend/LeavePlatform.API/Services/Interfaces/IUserService.cs`
- Create: `backend/LeavePlatform.API/Services/UserService.cs`
- Create: `backend/LeavePlatform.API/Controllers/UsersController.cs`
- Modify: `backend/LeavePlatform.API/Program.cs`

- [ ] **Step 1: Create `DTOs/User/UserDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.User;

public class UserDto
{
    public Guid Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string Role { get; set; }
    public string? Department { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public bool IsActive { get; set; }
}
```

- [ ] **Step 2: Create `DTOs/User/CreateUserDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.User;

public class CreateUserDto
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Role { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? ManagerId { get; set; }
}
```

- [ ] **Step 3: Create `DTOs/User/UpdateUserDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.User;

public class UpdateUserDto
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Role { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? ManagerId { get; set; }
    public bool IsActive { get; set; }
}
```

- [ ] **Step 4: Create `Services/Interfaces/IUserService.cs`**

```csharp
using LeavePlatform.API.DTOs.User;

namespace LeavePlatform.API.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> GetByIdAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto);
    Task DeactivateAsync(Guid id);
}
```

- [ ] **Step 5: Create `Services/UserService.cs`**

```csharp
using LeavePlatform.API.DTOs.User;
using LeavePlatform.API.Enums;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class UserService(
    IUserRepository userRepository,
    ILeaveTypeRepository leaveTypeRepository,
    ILeaveBalanceRepository leaveBalanceRepository) : IUserService
{
    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto> GetByIdAsync(Guid id)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");
        return MapToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var existing = await userRepository.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException("Email is already registered.");

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new ArgumentException("Invalid role.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            DepartmentId = dto.DepartmentId,
            ManagerId = dto.ManagerId
        };

        var created = await userRepository.CreateAsync(user);

        // Seed leave balances for this new user
        var leaveTypes = await leaveTypeRepository.GetAllAsync(activeOnly: true);
        var currentYear = DateTime.UtcNow.Year;
        foreach (var lt in leaveTypes)
        {
            await leaveBalanceRepository.CreateAsync(new LeaveBalance
            {
                UserId = created.Id,
                LeaveTypeId = lt.Id,
                Year = currentYear,
                TotalDays = lt.DefaultDays,
                UsedDays = 0
            });
        }

        return MapToDto(created);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new ArgumentException("Invalid role.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Role = role;
        user.DepartmentId = dto.DepartmentId;
        user.ManagerId = dto.ManagerId;
        user.IsActive = dto.IsActive;

        var updated = await userRepository.UpdateAsync(user);
        return MapToDto(updated);
    }

    public async Task DeactivateAsync(Guid id)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");

        user.IsActive = false;
        await userRepository.UpdateAsync(user);
    }

    private static UserDto MapToDto(User u) => new()
    {
        Id = u.Id,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        Role = u.Role.ToString(),
        Department = u.Department?.Name,
        DepartmentId = u.DepartmentId,
        ManagerId = u.ManagerId,
        ManagerName = u.Manager is not null ? $"{u.Manager.FirstName} {u.Manager.LastName}" : null,
        IsActive = u.IsActive
    };
}
```

- [ ] **Step 6: Create `Controllers/UsersController.cs`**

```csharp
using LeavePlatform.API.DTOs.User;
using LeavePlatform.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeavePlatform.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await userService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try { return Ok(await userService.GetByIdAsync(id)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        try
        {
            var result = await userService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateUserDto dto)
    {
        try { return Ok(await userService.UpdateAsync(id, dto)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        try { await userService.DeactivateAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}
```

- [ ] **Step 7: Register in `Program.cs`** — before `var app = builder.Build();`

```csharp
builder.Services.AddScoped<IUserService, UserService>();
```

- [ ] **Step 8: Build and verify**

```bash
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s)`

- [ ] **Step 9: Commit**

```bash
git add backend/
git commit -m "feat: add user management endpoints (admin only) with leave balance seeding"
```

---

## Task 8: Leave Balances

**Files:**
- Create: `backend/LeavePlatform.API/DTOs/LeaveBalance/LeaveBalanceDto.cs`
- Create: `backend/LeavePlatform.API/Repositories/Interfaces/ILeaveBalanceRepository.cs`
- Create: `backend/LeavePlatform.API/Repositories/LeaveBalanceRepository.cs`
- Create: `backend/LeavePlatform.API/Services/Interfaces/ILeaveBalanceService.cs`
- Create: `backend/LeavePlatform.API/Services/LeaveBalanceService.cs`
- Create: `backend/LeavePlatform.API/Controllers/LeaveBalancesController.cs`
- Modify: `backend/LeavePlatform.API/Program.cs`

- [ ] **Step 1: Create `DTOs/LeaveBalance/LeaveBalanceDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.LeaveBalance;

public class LeaveBalanceDto
{
    public Guid Id { get; set; }
    public required string LeaveTypeName { get; set; }
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays { get; set; }
}
```

- [ ] **Step 2: Create `Repositories/Interfaces/ILeaveBalanceRepository.cs`**

```csharp
using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface ILeaveBalanceRepository
{
    Task<IEnumerable<LeaveBalance>> GetByUserIdAsync(Guid userId, int year);
    Task<LeaveBalance?> GetByUserAndTypeAsync(Guid userId, Guid leaveTypeId, int year);
    Task<LeaveBalance> CreateAsync(LeaveBalance balance);
    Task<LeaveBalance> UpdateAsync(LeaveBalance balance);
}
```

- [ ] **Step 3: Create `Repositories/LeaveBalanceRepository.cs`**

```csharp
using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class LeaveBalanceRepository(AppDbContext context) : ILeaveBalanceRepository
{
    public async Task<IEnumerable<LeaveBalance>> GetByUserIdAsync(Guid userId, int year) =>
        await context.LeaveBalances
            .Include(b => b.LeaveType)
            .Where(b => b.UserId == userId && b.Year == year)
            .ToListAsync();

    public async Task<LeaveBalance?> GetByUserAndTypeAsync(Guid userId, Guid leaveTypeId, int year) =>
        await context.LeaveBalances
            .FirstOrDefaultAsync(b => b.UserId == userId && b.LeaveTypeId == leaveTypeId && b.Year == year);

    public async Task<LeaveBalance> CreateAsync(LeaveBalance balance)
    {
        context.LeaveBalances.Add(balance);
        await context.SaveChangesAsync();
        return balance;
    }

    public async Task<LeaveBalance> UpdateAsync(LeaveBalance balance)
    {
        context.LeaveBalances.Update(balance);
        await context.SaveChangesAsync();
        return balance;
    }
}
```

- [ ] **Step 4: Create `Services/Interfaces/ILeaveBalanceService.cs`**

```csharp
using LeavePlatform.API.DTOs.LeaveBalance;

namespace LeavePlatform.API.Services.Interfaces;

public interface ILeaveBalanceService
{
    Task<IEnumerable<LeaveBalanceDto>> GetMyBalancesAsync(Guid userId);
    Task<IEnumerable<LeaveBalanceDto>> GetUserBalancesAsync(Guid userId);
}
```

- [ ] **Step 5: Create `Services/LeaveBalanceService.cs`**

```csharp
using LeavePlatform.API.DTOs.LeaveBalance;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class LeaveBalanceService(ILeaveBalanceRepository leaveBalanceRepository) : ILeaveBalanceService
{
    public async Task<IEnumerable<LeaveBalanceDto>> GetMyBalancesAsync(Guid userId) =>
        await GetUserBalancesAsync(userId);

    public async Task<IEnumerable<LeaveBalanceDto>> GetUserBalancesAsync(Guid userId)
    {
        var balances = await leaveBalanceRepository.GetByUserIdAsync(userId, DateTime.UtcNow.Year);
        return balances.Select(b => new LeaveBalanceDto
        {
            Id = b.Id,
            LeaveTypeName = b.LeaveType.Name,
            Year = b.Year,
            TotalDays = b.TotalDays,
            UsedDays = b.UsedDays,
            RemainingDays = b.RemainingDays
        });
    }
}
```

- [ ] **Step 6: Create `Controllers/LeaveBalancesController.cs`**

```csharp
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
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await leaveBalanceService.GetMyBalancesAsync(userId));
    }

    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByUser(Guid userId) =>
        Ok(await leaveBalanceService.GetUserBalancesAsync(userId));
}
```

- [ ] **Step 7: Register in `Program.cs`** — before `var app = builder.Build();`

```csharp
builder.Services.AddScoped<ILeaveBalanceRepository, LeaveBalanceRepository>();
builder.Services.AddScoped<ILeaveBalanceService, LeaveBalanceService>();
```

- [ ] **Step 8: Build and verify**

```bash
dotnet build
```

Expected: `Build succeeded.`

- [ ] **Step 9: Commit**

```bash
git add backend/
git commit -m "feat: add leave balance endpoints"
```

---

## Task 9: Leave Requests — Employee & Manager Flows

**Files:**
- Create: `backend/LeavePlatform.API/DTOs/LeaveRequest/LeaveRequestDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/LeaveRequest/CreateLeaveRequestDto.cs`
- Create: `backend/LeavePlatform.API/DTOs/LeaveRequest/ReviewLeaveRequestDto.cs`
- Create: `backend/LeavePlatform.API/Repositories/Interfaces/ILeaveRequestRepository.cs`
- Create: `backend/LeavePlatform.API/Repositories/LeaveRequestRepository.cs`
- Create: `backend/LeavePlatform.API/Services/Interfaces/ILeaveRequestService.cs`
- Create: `backend/LeavePlatform.API/Services/LeaveRequestService.cs`
- Create: `backend/LeavePlatform.API/Controllers/LeaveRequestsController.cs`
- Create: `backend/LeavePlatform.Tests/Services/LeaveRequestServiceTests.cs`
- Modify: `backend/LeavePlatform.API/Program.cs`

- [ ] **Step 1: Create `DTOs/LeaveRequest/LeaveRequestDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.LeaveRequest;

public class LeaveRequestDto
{
    public Guid Id { get; set; }
    public required string EmployeeName { get; set; }
    public required string LeaveTypeName { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }
    public required string Status { get; set; }
    public string? EmployeeComment { get; set; }
    public string? ManagerComment { get; set; }
    public string? ReviewedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

- [ ] **Step 2: Create `DTOs/LeaveRequest/CreateLeaveRequestDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.LeaveRequest;

public class CreateLeaveRequestDto
{
    public Guid LeaveTypeId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? EmployeeComment { get; set; }
}
```

- [ ] **Step 3: Create `DTOs/LeaveRequest/ReviewLeaveRequestDto.cs`**

```csharp
namespace LeavePlatform.API.DTOs.LeaveRequest;

public class ReviewLeaveRequestDto
{
    public string? ManagerComment { get; set; }
}
```

- [ ] **Step 4: Create `Repositories/Interfaces/ILeaveRequestRepository.cs`**

```csharp
using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface ILeaveRequestRepository
{
    Task<IEnumerable<LeaveRequest>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<LeaveRequest>> GetByManagerAsync(Guid managerId);
    Task<LeaveRequest?> GetByIdAsync(Guid id);
    Task<LeaveRequest> CreateAsync(LeaveRequest request);
    Task<LeaveRequest> UpdateAsync(LeaveRequest request);
}
```

- [ ] **Step 5: Create `Repositories/LeaveRequestRepository.cs`**

```csharp
using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Repositories;

public class LeaveRequestRepository(AppDbContext context) : ILeaveRequestRepository
{
    public async Task<IEnumerable<LeaveRequest>> GetByUserIdAsync(Guid userId) =>
        await context.LeaveRequests
            .Include(r => r.LeaveType)
            .Include(r => r.ReviewedBy)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<LeaveRequest>> GetByManagerAsync(Guid managerId) =>
        await context.LeaveRequests
            .Include(r => r.User)
            .Include(r => r.LeaveType)
            .Where(r => r.User.ManagerId == managerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<LeaveRequest?> GetByIdAsync(Guid id) =>
        await context.LeaveRequests
            .Include(r => r.User)
            .Include(r => r.LeaveType)
            .Include(r => r.ReviewedBy)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<LeaveRequest> CreateAsync(LeaveRequest request)
    {
        context.LeaveRequests.Add(request);
        await context.SaveChangesAsync();
        return request;
    }

    public async Task<LeaveRequest> UpdateAsync(LeaveRequest request)
    {
        request.UpdatedAt = DateTime.UtcNow;
        context.LeaveRequests.Update(request);
        await context.SaveChangesAsync();
        return request;
    }
}
```

- [ ] **Step 6: Create `Services/Interfaces/ILeaveRequestService.cs`**

```csharp
using LeavePlatform.API.DTOs.LeaveRequest;

namespace LeavePlatform.API.Services.Interfaces;

public interface ILeaveRequestService
{
    Task<IEnumerable<LeaveRequestDto>> GetMyRequestsAsync(Guid userId);
    Task<IEnumerable<LeaveRequestDto>> GetTeamRequestsAsync(Guid managerId);
    Task<LeaveRequestDto> CreateAsync(Guid userId, CreateLeaveRequestDto dto);
    Task CancelAsync(Guid requestId, Guid userId);
    Task<LeaveRequestDto> ApproveAsync(Guid requestId, Guid managerId, ReviewLeaveRequestDto dto);
    Task<LeaveRequestDto> RejectAsync(Guid requestId, Guid managerId, ReviewLeaveRequestDto dto);
}
```

- [ ] **Step 7: Write the failing test**

Create `backend/LeavePlatform.Tests/Services/LeaveRequestServiceTests.cs`:

```csharp
using FluentAssertions;
using LeavePlatform.API.DTOs.LeaveRequest;
using LeavePlatform.API.Enums;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services;
using Moq;

namespace LeavePlatform.Tests.Services;

public class LeaveRequestServiceTests
{
    private readonly Mock<ILeaveRequestRepository> _requestRepoMock = new();
    private readonly Mock<ILeaveBalanceRepository> _balanceRepoMock = new();
    private readonly Mock<ILeaveTypeRepository> _leaveTypeRepoMock = new();
    private readonly Mock<IAuditLogRepository> _auditLogRepoMock = new();
    private readonly Mock<IEmailService> _emailServiceMock = new();

    private LeaveRequestService CreateService() => new(
        _requestRepoMock.Object,
        _balanceRepoMock.Object,
        _leaveTypeRepoMock.Object,
        _auditLogRepoMock.Object,
        _emailServiceMock.Object);

    [Fact]
    public async Task CreateAsync_WithSufficientBalance_CreatesRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var leaveTypeId = Guid.NewGuid();
        var dto = new CreateLeaveRequestDto
        {
            LeaveTypeId = leaveTypeId,
            StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(3))
        };

        _leaveTypeRepoMock.Setup(r => r.GetByIdAsync(leaveTypeId))
            .ReturnsAsync(new LeaveType { Id = leaveTypeId, Name = "Annual", DefaultDays = 21 });

        _balanceRepoMock.Setup(r => r.GetByUserAndTypeAsync(userId, leaveTypeId, It.IsAny<int>()))
            .ReturnsAsync(new LeaveBalance
            {
                UserId = userId,
                LeaveTypeId = leaveTypeId,
                Year = DateTime.UtcNow.Year,
                TotalDays = 21,
                UsedDays = 0
            });

        _requestRepoMock.Setup(r => r.CreateAsync(It.IsAny<LeaveRequest>()))
            .ReturnsAsync((LeaveRequest r) =>
            {
                r.LeaveType = new LeaveType { Name = "Annual", DefaultDays = 21 };
                r.User = new User { FirstName = "John", LastName = "Doe", Email = "j@j.com", PasswordHash = "" };
                return r;
            });

        var service = CreateService();

        // Act
        var result = await service.CreateAsync(userId, dto);

        // Assert
        result.TotalDays.Should().Be(3);
        result.Status.Should().Be(LeaveStatus.Pending.ToString());
    }

    [Fact]
    public async Task CreateAsync_WithInsufficientBalance_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var leaveTypeId = Guid.NewGuid();
        var dto = new CreateLeaveRequestDto
        {
            LeaveTypeId = leaveTypeId,
            StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(10))
        };

        _leaveTypeRepoMock.Setup(r => r.GetByIdAsync(leaveTypeId))
            .ReturnsAsync(new LeaveType { Id = leaveTypeId, Name = "Annual", DefaultDays = 21 });

        _balanceRepoMock.Setup(r => r.GetByUserAndTypeAsync(userId, leaveTypeId, It.IsAny<int>()))
            .ReturnsAsync(new LeaveBalance
            {
                UserId = userId,
                LeaveTypeId = leaveTypeId,
                Year = DateTime.UtcNow.Year,
                TotalDays = 5,
                UsedDays = 4
            });

        var service = CreateService();

        // Act & Assert
        await service.Invoking(s => s.CreateAsync(userId, dto))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*insufficient*");
    }
}
```

- [ ] **Step 8: Run tests to confirm they fail**

```bash
cd backend
dotnet test 2>&1 | tail -5
```

Expected: Build errors — `IEmailService` and `IAuditLogRepository` don't exist yet.

- [ ] **Step 9: Create `Repositories/Interfaces/IAuditLogRepository.cs`**

```csharp
using LeavePlatform.API.Models;

namespace LeavePlatform.API.Repositories.Interfaces;

public interface IAuditLogRepository
{
    Task LogAsync(Guid userId, string action, string entityType, string entityId);
}
```

- [ ] **Step 10: Create `Repositories/AuditLogRepository.cs`**

```csharp
using LeavePlatform.API.Data;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;

namespace LeavePlatform.API.Repositories;

public class AuditLogRepository(AppDbContext context) : IAuditLogRepository
{
    public async Task LogAsync(Guid userId, string action, string entityType, string entityId)
    {
        context.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId
        });
        await context.SaveChangesAsync();
    }
}
```

- [ ] **Step 11: Create `Services/Interfaces/IEmailService.cs`**

```csharp
namespace LeavePlatform.API.Services.Interfaces;

public interface IEmailService
{
    Task SendLeaveSubmittedAsync(string employeeEmail, string employeeName, string leaveType, DateOnly start, DateOnly end);
    Task SendLeaveApprovedAsync(string employeeEmail, string employeeName, string leaveType, string? managerComment);
    Task SendLeaveRejectedAsync(string employeeEmail, string employeeName, string leaveType, string? managerComment);
    Task SendPendingApprovalAsync(string managerEmail, string managerName, string employeeName, string leaveType);
}
```

- [ ] **Step 12: Create `Services/LeaveRequestService.cs`**

```csharp
using LeavePlatform.API.DTOs.LeaveRequest;
using LeavePlatform.API.Enums;
using LeavePlatform.API.Models;
using LeavePlatform.API.Repositories.Interfaces;
using LeavePlatform.API.Services.Interfaces;

namespace LeavePlatform.API.Services;

public class LeaveRequestService(
    ILeaveRequestRepository leaveRequestRepository,
    ILeaveBalanceRepository leaveBalanceRepository,
    ILeaveTypeRepository leaveTypeRepository,
    IAuditLogRepository auditLogRepository,
    IEmailService emailService) : ILeaveRequestService
{
    public async Task<IEnumerable<LeaveRequestDto>> GetMyRequestsAsync(Guid userId)
    {
        var requests = await leaveRequestRepository.GetByUserIdAsync(userId);
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetTeamRequestsAsync(Guid managerId)
    {
        var requests = await leaveRequestRepository.GetByManagerAsync(managerId);
        return requests.Select(MapToDto);
    }

    public async Task<LeaveRequestDto> CreateAsync(Guid userId, CreateLeaveRequestDto dto)
    {
        var leaveType = await leaveTypeRepository.GetByIdAsync(dto.LeaveTypeId)
            ?? throw new KeyNotFoundException("Leave type not found.");

        var totalDays = dto.EndDate.DayNumber - dto.StartDate.DayNumber + 1;

        var balance = await leaveBalanceRepository.GetByUserAndTypeAsync(userId, dto.LeaveTypeId, DateTime.UtcNow.Year)
            ?? throw new InvalidOperationException("No leave balance found for this leave type.");

        if (balance.RemainingDays < totalDays)
            throw new InvalidOperationException($"Insufficient leave balance. Remaining: {balance.RemainingDays} days, Requested: {totalDays} days.");

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

        await auditLogRepository.LogAsync(userId, "LeaveRequest.Created", "LeaveRequest", created.Id.ToString());

        return MapToDto(created);
    }

    public async Task CancelAsync(Guid requestId, Guid userId)
    {
        var request = await leaveRequestRepository.GetByIdAsync(requestId)
            ?? throw new KeyNotFoundException("Leave request not found.");

        if (request.UserId != userId)
            throw new UnauthorizedAccessException("You can only cancel your own requests.");

        if (request.Status != LeaveStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be cancelled.");

        request.Status = LeaveStatus.Rejected;
        await leaveRequestRepository.UpdateAsync(request);
        await auditLogRepository.LogAsync(userId, "LeaveRequest.Cancelled", "LeaveRequest", requestId.ToString());
    }

    public async Task<LeaveRequestDto> ApproveAsync(Guid requestId, Guid managerId, ReviewLeaveRequestDto dto)
    {
        var request = await leaveRequestRepository.GetByIdAsync(requestId)
            ?? throw new KeyNotFoundException("Leave request not found.");

        if (request.Status != LeaveStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be approved.");

        request.Status = LeaveStatus.Approved;
        request.ManagerComment = dto.ManagerComment;
        request.ReviewedByUserId = managerId;

        // Deduct from balance
        var balance = await leaveBalanceRepository.GetByUserAndTypeAsync(
            request.UserId, request.LeaveTypeId, DateTime.UtcNow.Year);

        if (balance is not null)
        {
            balance.UsedDays += request.TotalDays;
            await leaveBalanceRepository.UpdateAsync(balance);
        }

        var updated = await leaveRequestRepository.UpdateAsync(request);
        await auditLogRepository.LogAsync(managerId, "LeaveRequest.Approved", "LeaveRequest", requestId.ToString());

        return MapToDto(updated);
    }

    public async Task<LeaveRequestDto> RejectAsync(Guid requestId, Guid managerId, ReviewLeaveRequestDto dto)
    {
        var request = await leaveRequestRepository.GetByIdAsync(requestId)
            ?? throw new KeyNotFoundException("Leave request not found.");

        if (request.Status != LeaveStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be rejected.");

        request.Status = LeaveStatus.Rejected;
        request.ManagerComment = dto.ManagerComment;
        request.ReviewedByUserId = managerId;

        var updated = await leaveRequestRepository.UpdateAsync(request);
        await auditLogRepository.LogAsync(managerId, "LeaveRequest.Rejected", "LeaveRequest", requestId.ToString());

        return MapToDto(updated);
    }

    private static LeaveRequestDto MapToDto(LeaveRequest r) => new()
    {
        Id = r.Id,
        EmployeeName = r.User is not null ? $"{r.User.FirstName} {r.User.LastName}" : "Unknown",
        LeaveTypeName = r.LeaveType?.Name ?? "Unknown",
        StartDate = r.StartDate,
        EndDate = r.EndDate,
        TotalDays = r.TotalDays,
        Status = r.Status.ToString(),
        EmployeeComment = r.EmployeeComment,
        ManagerComment = r.ManagerComment,
        ReviewedBy = r.ReviewedBy is not null ? $"{r.ReviewedBy.FirstName} {r.ReviewedBy.LastName}" : null,
        CreatedAt = r.CreatedAt
    };
}
```

- [ ] **Step 13: Create `Controllers/LeaveRequestsController.cs`**

```csharp
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
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine() =>
        Ok(await leaveRequestService.GetMyRequestsAsync(CurrentUserId));

    [HttpPost]
    public async Task<IActionResult> Create(CreateLeaveRequestDto dto)
    {
        try
        {
            var result = await leaveRequestService.CreateAsync(CurrentUserId, dto);
            return CreatedAtAction(nameof(GetMine), result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try
        {
            await leaveRequestService.CancelAsync(id, CurrentUserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("team")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<IActionResult> GetTeam() =>
        Ok(await leaveRequestService.GetTeamRequestsAsync(CurrentUserId));

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<IActionResult> Approve(Guid id, ReviewLeaveRequestDto dto)
    {
        try
        {
            var result = await leaveRequestService.ApproveAsync(id, CurrentUserId, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<IActionResult> Reject(Guid id, ReviewLeaveRequestDto dto)
    {
        try
        {
            var result = await leaveRequestService.RejectAsync(id, CurrentUserId, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
```

- [ ] **Step 14: Register in `Program.cs`** — before `var app = builder.Build();`

```csharp
builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
```

- [ ] **Step 15: Run the tests**

```bash
cd backend
dotnet test -v normal
```

Expected: All tests pass. `Passed! - Failed: 0`

- [ ] **Step 16: Commit**

```bash
git add backend/
git commit -m "feat: add leave request endpoints for employee and manager flows"
```

---

## Task 10: Reports Endpoint (Admin)

**Files:**
- Create: `backend/LeavePlatform.API/Controllers/ReportsController.cs`

- [ ] **Step 1: Create `Controllers/ReportsController.cs`**

```csharp
using LeavePlatform.API.Data;
using LeavePlatform.API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeavePlatform.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin")]
public class ReportsController(AppDbContext context) : ControllerBase
{
    [HttpGet("leave-summary")]
    public async Task<IActionResult> GetLeaveSummary()
    {
        var summary = await context.LeaveRequests
            .Include(r => r.User)
                .ThenInclude(u => u.Department)
            .Include(r => r.LeaveType)
            .GroupBy(r => new
            {
                Department = r.User.Department != null ? r.User.Department.Name : "No Department",
                LeaveType = r.LeaveType.Name,
                r.Status
            })
            .Select(g => new
            {
                g.Key.Department,
                g.Key.LeaveType,
                Status = g.Key.Status.ToString(),
                Count = g.Count(),
                TotalDays = g.Sum(r => r.TotalDays)
            })
            .ToListAsync();

        return Ok(summary);
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var logs = await context.AuditLogs
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                l.Id,
                PerformedBy = $"{l.User.FirstName} {l.User.LastName}",
                l.Action,
                l.EntityType,
                l.EntityId,
                l.CreatedAt
            })
            .ToListAsync();

        return Ok(logs);
    }
}
```

- [ ] **Step 2: Build and verify**

```bash
dotnet build
```

Expected: `Build succeeded.`

- [ ] **Step 3: Commit**

```bash
git add backend/LeavePlatform.API/Controllers/ReportsController.cs
git commit -m "feat: add reports and audit log endpoints (admin only)"
```

---

## Task 11: Email Notifications (Resend)

**Files:**
- Create: `backend/LeavePlatform.API/Services/EmailService.cs`
- Modify: `backend/LeavePlatform.API/Program.cs`
- Modify: `backend/LeavePlatform.API/Services/LeaveRequestService.cs`

- [ ] **Step 1: Create `Services/EmailService.cs`**

```csharp
using LeavePlatform.API.Services.Interfaces;
using Resend;

namespace LeavePlatform.API.Services;

public class EmailService(IResend resend, IConfiguration config) : IEmailService
{
    private readonly string _fromEmail = config["Resend:FromEmail"] ?? "noreply@yourdomain.com";

    public async Task SendLeaveSubmittedAsync(string employeeEmail, string employeeName, string leaveType, DateOnly start, DateOnly end)
    {
        var message = new EmailMessage
        {
            From = _fromEmail,
            To = { employeeEmail },
            Subject = "Leave Request Submitted",
            HtmlBody = $"""
                <h2>Leave Request Received</h2>
                <p>Hi {employeeName},</p>
                <p>Your <strong>{leaveType}</strong> leave request from <strong>{start:dd MMM yyyy}</strong> to <strong>{end:dd MMM yyyy}</strong> has been submitted and is pending approval.</p>
                <p>You will be notified once it has been reviewed.</p>
                """
        };
        await resend.EmailSendAsync(message);
    }

    public async Task SendLeaveApprovedAsync(string employeeEmail, string employeeName, string leaveType, string? managerComment)
    {
        var comment = string.IsNullOrEmpty(managerComment) ? "" : $"<p><strong>Manager comment:</strong> {managerComment}</p>";
        var message = new EmailMessage
        {
            From = _fromEmail,
            To = { employeeEmail },
            Subject = "Leave Request Approved",
            HtmlBody = $"""
                <h2>Leave Request Approved</h2>
                <p>Hi {employeeName},</p>
                <p>Your <strong>{leaveType}</strong> leave request has been <strong style="color:green">approved</strong>.</p>
                {comment}
                """
        };
        await resend.EmailSendAsync(message);
    }

    public async Task SendLeaveRejectedAsync(string employeeEmail, string employeeName, string leaveType, string? managerComment)
    {
        var comment = string.IsNullOrEmpty(managerComment) ? "" : $"<p><strong>Manager comment:</strong> {managerComment}</p>";
        var message = new EmailMessage
        {
            From = _fromEmail,
            To = { employeeEmail },
            Subject = "Leave Request Rejected",
            HtmlBody = $"""
                <h2>Leave Request Rejected</h2>
                <p>Hi {employeeName},</p>
                <p>Your <strong>{leaveType}</strong> leave request has been <strong style="color:red">rejected</strong>.</p>
                {comment}
                """
        };
        await resend.EmailSendAsync(message);
    }

    public async Task SendPendingApprovalAsync(string managerEmail, string managerName, string employeeName, string leaveType)
    {
        var message = new EmailMessage
        {
            From = _fromEmail,
            To = { managerEmail },
            Subject = "New Leave Request Pending Approval",
            HtmlBody = $"""
                <h2>New Leave Request</h2>
                <p>Hi {managerName},</p>
                <p><strong>{employeeName}</strong> has submitted a <strong>{leaveType}</strong> leave request that requires your approval.</p>
                <p>Please log in to review it.</p>
                """
        };
        await resend.EmailSendAsync(message);
    }
}
```

- [ ] **Step 2: Register Resend and EmailService in `Program.cs`** — add before `var app = builder.Build();`

```csharp
builder.Services.AddResend(options =>
    options.ApiToken = builder.Configuration["Resend:ApiKey"]!);

builder.Services.AddScoped<IEmailService, EmailService>();
```

- [ ] **Step 3: Wire emails into `LeaveRequestService.cs`**

In `CreateAsync`, after `await auditLogRepository.LogAsync(...)`, add:

```csharp
// Fire-and-forget email — don't await so it doesn't slow down the response
_ = emailService.SendLeaveSubmittedAsync(
    request.User?.Email ?? "",
    $"{request.User?.FirstName} {request.User?.LastName}",
    leaveType.Name,
    dto.StartDate,
    dto.EndDate);
```

In `ApproveAsync`, after `await auditLogRepository.LogAsync(...)`, add:

```csharp
_ = emailService.SendLeaveApprovedAsync(
    request.User?.Email ?? "",
    $"{request.User?.FirstName} {request.User?.LastName}",
    request.LeaveType?.Name ?? "",
    dto.ManagerComment);
```

In `RejectAsync`, after `await auditLogRepository.LogAsync(...)`, add:

```csharp
_ = emailService.SendLeaveRejectedAsync(
    request.User?.Email ?? "",
    $"{request.User?.FirstName} {request.User?.LastName}",
    request.LeaveType?.Name ?? "",
    dto.ManagerComment);
```

- [ ] **Step 4: Build and verify**

```bash
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s)`

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat: add Resend email notifications for leave request lifecycle"
```

---

## Task 12: Dockerfile & Deployment Setup

**Files:**
- Create: `backend/LeavePlatform.API/Dockerfile`
- Create: `README.md`

- [ ] **Step 1: Create `backend/LeavePlatform.API/Dockerfile`**

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["LeavePlatform.API.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "LeavePlatform.API.dll"]
```

- [ ] **Step 2: Test the Docker build locally**

From the `backend/LeavePlatform.API` directory:

```bash
docker build -t leaveplatform-api .
```

Expected: `Successfully built <id>` and `Successfully tagged leaveplatform-api:latest`

- [ ] **Step 3: Test running the container locally**

```bash
docker run -p 5000:8080 \
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Database=leaveplatform;Username=postgres;Password=postgres" \
  -e Jwt__Key="local-dev-secret-key-must-be-at-least-32-characters-long!!" \
  -e Jwt__Issuer="LeavePlatform" \
  -e Jwt__Audience="LeavePlatformUsers" \
  -e Resend__ApiKey="re_placeholder" \
  -e AllowedOrigins="http://localhost:4200" \
  leaveplatform-api
```

Open `http://localhost:5000/swagger` — Swagger UI should load. Press Ctrl+C to stop.

- [ ] **Step 4: Create `README.md` at the repo root**

```markdown
# belcoLeavePortal

Enterprise Leave Management System — ASP.NET Core 8 API + Angular 17 frontend.

## Quick Start (Local)

**Prerequisites:** Docker Desktop, .NET 8 SDK

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in values
3. Start the database: `docker compose up db -d`
4. Run the API: `cd backend/LeavePlatform.API && dotnet run`
5. API available at: `http://localhost:5000`
6. Swagger UI: `http://localhost:5000/swagger`

## Running Tests

```bash
cd backend
dotnet test
```

## Deployment

- **API:** Docker container on Render — set env vars in Render dashboard
- **Frontend:** Angular on Vercel (see Plan 2)
- **Database:** Neon PostgreSQL — connection string in env vars
```

- [ ] **Step 5: Set up git remote and push**

```bash
git branch -M main
git remote add origin https://github.com/shaggybelco/belcoLeavePortal.git
git push -u origin main
```

- [ ] **Step 6: Final test run**

```bash
cd backend
dotnet test -v normal
```

Expected: All tests pass. `Passed! - Failed: 0`

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: add Dockerfile, docker-compose, and README"
git push
```

---

## Plan 2 (Next)

The Angular frontend plan (`2026-05-13-frontend-angular.md`) will cover:
- Angular project scaffold with routing and standalone components
- JWT interceptor and route guards
- Employee dashboard, leave application form, history page
- Manager dashboard and requests review
- Admin panels for users, departments, leave types, reports
- Vercel deployment configuration

Start Plan 2 only after this API plan is complete and the backend is deployed to Render.
