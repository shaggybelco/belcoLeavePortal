# Leave Management System — Design Spec
**Date:** 2026-05-13  
**Status:** Approved

---

## 1. Project Overview

An enterprise-style web application that digitizes the employee leave approval process. Employees apply for leave, managers approve or reject requests, and admins manage the entire system including users, departments, leave types, and reporting.

**Goals:**
- Replace manual leave processes (spreadsheets, emails, paper) with a digital workflow
- Enforce role-based access so each user only sees what is relevant to them
- Provide real-time leave balance tracking and team visibility
- Serve as a portfolio and learning project demonstrating enterprise .NET + Angular patterns

---

## 2. Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Angular 17+ (Standalone Components) | Vercel |
| Backend | ASP.NET Core 8 Web API | Render (Docker) |
| Database | PostgreSQL via EF Core + Npgsql | Neon (serverless) |
| Auth | JWT (role-based access control) | — |
| Email | Resend API | — |
| Local Dev | docker-compose with local PostgreSQL | — |

---

## 3. Architecture

### System Diagram
```
┌─────────────────────────────────────┐
│           Vercel (Angular)           │
│  Auth · Employee · Manager · Admin   │
└──────────────────┬──────────────────┘
                   │ HTTPS + JWT
┌──────────────────▼──────────────────┐
│       Render (Docker / ASP.NET)      │
│                                      │
│  Controllers                         │
│    └─ Services (business logic)      │
│         └─ Repositories (data)       │
│              └─ EF Core             │
└──────────────────┬──────────────────┘
        ┌──────────┴───────────┐
        │                      │
┌───────▼───────┐    ┌─────────▼──────┐
│ Neon Postgres  │    │  Resend Email  │
└───────────────┘    └────────────────┘
```

### Backend Pattern: Layered Architecture
```
Controllers  →  Services  →  Repositories  →  EF Core  →  PostgreSQL
```
- **Controllers** — handle HTTP requests, validate input, return responses
- **Services** — contain all business logic (balance calculation, approval rules)
- **Repositories** — all database queries live here, services never touch EF Core directly
- **EF Core** — maps C# models to database tables, runs migrations

### Roles
- **Employee** — applies for leave, tracks status, views own balance
- **Manager** — reviews and approves/rejects team requests, views team calendar
- **Admin** — manages users, departments, leave types, views reports and audit logs

---

## 4. Database Schema

### Users
| Column | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| FirstName | string | |
| LastName | string | |
| Email | string | unique |
| PasswordHash | string | bcrypt hashed |
| Role | enum | Employee, Manager, Admin |
| DepartmentId | Guid FK | → Departments |
| ManagerId | Guid FK (nullable) | self-reference → Users |
| IsActive | bool | soft delete |
| CreatedAt | DateTime | |

### Departments
| Column | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| Name | string | |

### LeaveTypes
| Column | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| Name | string | e.g. Annual, Sick, Maternity |
| DefaultDays | int | days allocated per year |
| IsActive | bool | admin can deactivate |

### LeaveBalances
| Column | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| UserId | Guid FK | → Users |
| LeaveTypeId | Guid FK | → LeaveTypes |
| Year | int | one row per user per type per year |
| TotalDays | int | |
| UsedDays | int | |

### LeaveRequests
| Column | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| UserId | Guid FK | → Users (applicant) |
| LeaveTypeId | Guid FK | → LeaveTypes |
| StartDate | DateOnly | |
| EndDate | DateOnly | |
| TotalDays | int | calculated on submission |
| Status | enum | Pending, Approved, Rejected |
| EmployeeComment | string (nullable) | |
| ManagerComment | string (nullable) | |
| ReviewedByUserId | Guid FK (nullable) | → Users (manager) |
| CreatedAt | DateTime | |
| UpdatedAt | DateTime | |

### AuditLogs
| Column | Type | Notes |
|---|---|---|
| Id | Guid PK | |
| UserId | Guid FK | who performed the action |
| Action | string | e.g. "LeaveRequest.Approved" |
| EntityType | string | e.g. "LeaveRequest" |
| EntityId | string | the ID of the affected record |
| CreatedAt | DateTime | |

---

## 5. API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login           → returns JWT token
```

### Leave Requests
```
GET    /api/leave-requests/mine          [Employee]
POST   /api/leave-requests              [Employee]
DELETE /api/leave-requests/{id}         [Employee] — cancel pending only

GET    /api/leave-requests/team         [Manager]
PUT    /api/leave-requests/{id}/approve [Manager]
PUT    /api/leave-requests/{id}/reject  [Manager]
```

### Leave Balances
```
GET    /api/leave-balances/mine         [Employee]
GET    /api/leave-balances/user/{id}    [Admin]
```

### Leave Types
```
GET    /api/leave-types                 [All authenticated]
POST   /api/leave-types                 [Admin]
PUT    /api/leave-types/{id}            [Admin]
DELETE /api/leave-types/{id}            [Admin] — deactivates, not hard delete
```

### Departments
```
GET    /api/departments                 [Admin]
POST   /api/departments                 [Admin]
PUT    /api/departments/{id}            [Admin]
```

### Users
```
GET    /api/users                       [Admin]
POST   /api/users                       [Admin]
PUT    /api/users/{id}                  [Admin]
DELETE /api/users/{id}                  [Admin] — deactivates (IsActive = false)
```

### Reports
```
GET    /api/reports/leave-summary       [Admin]
GET    /api/reports/audit-logs          [Admin]
```

---

## 6. Angular Frontend Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          — AuthGuard, RoleGuard
│   │   ├── interceptors/    — JwtInterceptor (auto-attaches token)
│   │   ├── models/          — TypeScript interfaces
│   │   └── services/        — AuthService, StorageService
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── employee/
│   │   │   ├── dashboard/   — balance cards + pending requests
│   │   │   ├── apply/       — leave application form
│   │   │   └── history/     — past requests with status badges
│   │   │
│   │   ├── manager/
│   │   │   ├── dashboard/   — pending approvals summary
│   │   │   ├── requests/    — team requests list with approve/reject
│   │   │   └── team-calendar/
│   │   │
│   │   └── admin/
│   │       ├── users/
│   │       ├── departments/
│   │       ├── leave-types/
│   │       └── reports/
│   │
│   ├── shared/
│   │   └── components/      — StatusBadge, ConfirmModal, LoadingSpinner
│   │
│   └── app.routes.ts        — all routes with role guards applied
```

### Key Angular Concepts Used
- **Guards** — protect routes before they load; redirect unauthorized users
- **Interceptors** — attach JWT token to every outgoing HTTP request automatically
- **Standalone Components** — modern Angular 17+ pattern, no NgModules
- **Reactive Forms** — for leave application and admin forms with validation

---

## 7. Authentication & Authorization

### JWT Flow
1. User submits email + password to `POST /api/auth/login`
2. API verifies credentials, generates a JWT containing `userId`, `email`, and `role`
3. JWT is signed with a secret key stored in environment variables
4. Angular stores the token in `localStorage` and reads it on every request
5. `JwtInterceptor` attaches it as `Authorization: Bearer <token>` header
6. API uses `[Authorize(Roles = "Manager")]` attributes to enforce access per endpoint

### Password Security
- Passwords are hashed using **BCrypt** before storage — plain text is never saved
- The hash is a one-way transformation; even admins cannot recover a password

---

## 8. Email Notifications (Resend)

Triggered server-side by the API after state changes:

| Event | Recipient | Content |
|---|---|---|
| Leave request submitted | Employee | Confirmation with dates and type |
| Leave approved | Employee | Approval notice + manager comment |
| Leave rejected | Employee | Rejection notice + manager comment |
| New request pending | Manager | Notification to review team request |

Emails are sent asynchronously (fire-and-forget) so they don't slow down API responses.

---

## 9. Deployment

### Backend (Render)
- A `Dockerfile` in `/backend` builds and runs the ASP.NET Core API
- Render detects the Dockerfile and builds a container on every push to `main`
- Environment variables (DB connection string, JWT secret, Resend key) are set in Render's dashboard — never in code

### Frontend (Vercel)
- Vercel auto-detects Angular, runs `ng build`, and serves the output
- The API base URL is set as a Vercel environment variable (`VITE_API_URL` / Angular environment file)

### Local Development
- `docker-compose.yml` at the repo root spins up the API + a local PostgreSQL instance
- Neon is used in staging/production; local Postgres is used during development
- `.env` files are gitignored; `.env.example` is committed with placeholder values

### CORS
- The API explicitly allows requests from the Vercel domain
- Configured in `Program.cs` using ASP.NET Core's built-in CORS middleware
- Without this, the browser will block all API responses (common gotcha)

---

## 10. Repository Structure

```
belcoLeavePortal/
├── backend/
│   ├── LeavePlatform.API/         — ASP.NET Core project
│   ├── Dockerfile
│   └── LeavePlatform.sln
├── frontend/
│   └── leave-portal/              — Angular project
├── docker-compose.yml
├── .env.example
└── README.md
```
