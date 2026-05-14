# Belco Leave Portal

A full-stack leave management system for Belco. Employees apply for leave, managers approve or reject requests, and admins manage users, departments, and leave types.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 20, Angular Material |
| Backend | ASP.NET Core 10, Entity Framework Core |
| Database | PostgreSQL |
| Auth | JWT (RS256) |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Features

- **Employees** — view leave balances, apply for leave with live balance preview, track request status, cancel pending requests
- **Managers** — review and approve/reject team leave requests with optional comments
- **Admins** — manage users, departments, and leave types; view organisation-wide leave summaries and audit logs
- **All users** — change their own password; admins can reset any user's password

## Project Structure

```
belcoLeavePortal/
├── frontend/   # Angular 20 SPA
└── backend/    # ASP.NET Core 10 Web API
```

## Getting Started

### Prerequisites

- Node.js 20+
- .NET 10 SDK
- PostgreSQL

### Backend

```bash
cd backend/LeavePlatform.API
# Set connection string in appsettings.Development.json
dotnet ef database update
dotnet run
```

API runs on `https://localhost:7001`.

### Frontend

```bash
cd frontend
npm install
ng serve
```

App runs on `http://localhost:4200`.

### Environment

Create `frontend/src/environments/environment.development.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api'
};
```

## Roles

| Role | Access |
|------|--------|
| Employee | Dashboard, apply for leave, view own history |
| Manager | All employee access + team leave review |
| Admin | Full access including user/department/leave-type management and reports |
