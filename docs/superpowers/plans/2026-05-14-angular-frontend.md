# Angular Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a role-aware Angular 20 SPA that lets employees apply for leave, managers approve requests, and admins manage the system.

**Architecture:** Standalone components, reactive forms, JWT auth via HTTP interceptor, route guards per role. Three feature areas (employee, manager, admin) each with their own lazy-loaded route subtree.

**Tech Stack:** Angular 20, Angular Material (UI components), Angular Reactive Forms, Angular Router, HttpClient, RxJS, SCSS, Vercel deployment.

---

## File Map

```
frontend/src/
├── environments/
│   ├── environment.ts              — dev: apiUrl points to localhost
│   └── environment.prod.ts        — prod: apiUrl from build-time var
├── app/
│   ├── core/
│   │   ├── models/                 — TypeScript interfaces matching API DTOs
│   │   │   ├── user.model.ts
│   │   │   ├── leave-request.model.ts
│   │   │   ├── leave-balance.model.ts
│   │   │   ├── leave-type.model.ts
│   │   │   └── department.model.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts     — login, logout, token decode, currentUser signal
│   │   │   ├── leave-request.service.ts
│   │   │   ├── leave-balance.service.ts
│   │   │   ├── leave-type.service.ts
│   │   │   ├── department.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── report.service.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts — attaches Bearer token to every request
│   │   └── guards/
│   │       ├── auth.guard.ts       — redirect to /login if no token
│   │       └── role.guard.ts       — redirect to /unauthorized if wrong role
│   ├── shared/
│   │   └── components/
│   │       ├── status-badge/       — coloured chip for Pending/Approved/Rejected
│   │       ├── confirm-dialog/     — reusable yes/no modal
│   │       └── shell/              — top nav + sidebar layout shell
│   ├── features/
│   │   ├── auth/
│   │   │   └── login/              — login page (no register; admin creates users)
│   │   ├── employee/
│   │   │   ├── dashboard/          — balance cards + pending requests list
│   │   │   ├── apply/              — leave application form
│   │   │   └── history/            — full request history with cancel action
│   │   ├── manager/
│   │   │   ├── dashboard/          — pending requests count
│   │   │   └── requests/           — team requests list with approve/reject
│   │   └── admin/
│   │       ├── users/              — user list + create/edit/deactivate
│   │       ├── departments/        — departments CRUD
│   │       ├── leave-types/        — leave types CRUD
│   │       └── reports/            — leave summary table + audit log
│   ├── app.routes.ts
│   ├── app.config.ts
│   └── app.ts
```

---

### Task 1: Project Setup — Material, Environments, Core Config

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/environments/environment.ts`
- Create: `frontend/src/environments/environment.prod.ts`
- Modify: `frontend/src/app/app.config.ts`
- Modify: `frontend/angular.json`

- [ ] **Step 1: Install Angular Material**

```bash
cd frontend
npx ng add @angular/material --theme indigo-pink --typography --animations
```
Expected: package.json updated, material styles added to angular.json

- [ ] **Step 2: Create environment files**

`frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

`frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: '/api'
};
```

- [ ] **Step 3: Add fileReplacements in angular.json**

In `angular.json` under `projects.leave-platform-ui.architect.build.configurations.production`, ensure:
```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

- [ ] **Step 4: Update app.config.ts to wire up HttpClient and Router**

`frontend/src/app/app.config.ts`:
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync()
  ]
};
```

- [ ] **Step 5: Verify build**

```bash
cd frontend && npx ng build
```
Expected: Build succeeds with 0 errors

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "scaffold Angular frontend with Material and environment config"
```

---

### Task 2: Core Models and Services

**Files:**
- Create: `frontend/src/app/core/models/user.model.ts`
- Create: `frontend/src/app/core/models/leave-request.model.ts`
- Create: `frontend/src/app/core/models/leave-balance.model.ts`
- Create: `frontend/src/app/core/models/leave-type.model.ts`
- Create: `frontend/src/app/core/models/department.model.ts`
- Create: `frontend/src/app/core/services/auth.service.ts`
- Create: `frontend/src/app/core/services/leave-request.service.ts`
- Create: `frontend/src/app/core/services/leave-balance.service.ts`
- Create: `frontend/src/app/core/services/leave-type.service.ts`
- Create: `frontend/src/app/core/services/department.service.ts`
- Create: `frontend/src/app/core/services/user.service.ts`
- Create: `frontend/src/app/core/services/report.service.ts`

- [ ] **Step 1: Create models**

`frontend/src/app/core/models/user.model.ts`:
```typescript
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Employee' | 'Manager' | 'Admin';
  department?: string;
  departmentId?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  departmentId?: string;
  managerId?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: string;
  managerId?: string;
  isActive: boolean;
}
```

`frontend/src/app/core/models/leave-type.model.ts`:
```typescript
export interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
  isActive: boolean;
}

export interface CreateLeaveTypeRequest {
  name: string;
  defaultDays: number;
}

export interface UpdateLeaveTypeRequest {
  name: string;
  defaultDays: number;
  isActive: boolean;
}
```

`frontend/src/app/core/models/department.model.ts`:
```typescript
export interface Department {
  id: string;
  name: string;
}

export interface CreateDepartmentRequest {
  name: string;
}
```

`frontend/src/app/core/models/leave-balance.model.ts`:
```typescript
export interface LeaveBalance {
  id: string;
  leaveTypeName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
```

`frontend/src/app/core/models/leave-request.model.ts`:
```typescript
export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  employeeComment?: string;
  managerComment?: string;
  reviewedByName?: string;
  createdAt: string;
}

export interface CreateLeaveRequestRequest {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  employeeComment?: string;
}

export interface ReviewLeaveRequestRequest {
  action: 'Approved' | 'Rejected';
  managerComment?: string;
}
```

- [ ] **Step 2: Create AuthService**

`frontend/src/app/core/services/auth.service.ts`:
```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginRequest { email: string; password: string; }
interface LoginResponse { token: string; }
interface TokenPayload { sub: string; email: string; role: string; exp: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'leave_token';
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly currentUser = computed(() => this.decodeToken(this._token()));
  readonly isLoggedIn = computed(() => !!this._token() && !this.isExpired());
  readonly role = computed(() => this.currentUser()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this._token.set(res.token);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return this._token(); }

  private decodeToken(token: string | null): TokenPayload | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        sub: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? payload.sub,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? payload.email,
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role,
        exp: payload.exp
      };
    } catch { return null; }
  }

  private isExpired(): boolean {
    const user = this.decodeToken(this._token());
    return user ? user.exp * 1000 < Date.now() : true;
  }
}
```

- [ ] **Step 3: Create remaining services**

`frontend/src/app/core/services/leave-request.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LeaveRequest, CreateLeaveRequestRequest, ReviewLeaveRequestRequest } from '../models/leave-request.model';

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private base = `${environment.apiUrl}/leave-requests`;
  constructor(private http: HttpClient) {}

  getMine() { return this.http.get<LeaveRequest[]>(`${this.base}/my`); }
  getTeam() { return this.http.get<LeaveRequest[]>(`${this.base}/team`); }
  getAll() { return this.http.get<LeaveRequest[]>(this.base); }
  create(body: CreateLeaveRequestRequest) { return this.http.post<LeaveRequest>(this.base, body); }
  review(id: string, body: ReviewLeaveRequestRequest) { return this.http.put<LeaveRequest>(`${this.base}/${id}/review`, body); }
  cancel(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
```

`frontend/src/app/core/services/leave-balance.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LeaveBalance } from '../models/leave-balance.model';

@Injectable({ providedIn: 'root' })
export class LeaveBalanceService {
  private base = `${environment.apiUrl}/leave-balances`;
  constructor(private http: HttpClient) {}

  getMine(year?: number) {
    const params = year ? { year: year.toString() } : {};
    return this.http.get<LeaveBalance[]>(this.base, { params });
  }

  getForUser(userId: string, year?: number) {
    const params: Record<string, string> = { userId };
    if (year) params['year'] = year.toString();
    return this.http.get<LeaveBalance[]>(this.base, { params });
  }
}
```

`frontend/src/app/core/services/leave-type.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LeaveType, CreateLeaveTypeRequest, UpdateLeaveTypeRequest } from '../models/leave-type.model';

@Injectable({ providedIn: 'root' })
export class LeaveTypeService {
  private base = `${environment.apiUrl}/leave-types`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<LeaveType[]>(this.base); }
  create(body: CreateLeaveTypeRequest) { return this.http.post<LeaveType>(this.base, body); }
  update(id: string, body: UpdateLeaveTypeRequest) { return this.http.put<LeaveType>(`${this.base}/${id}`, body); }
  deactivate(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
```

`frontend/src/app/core/services/department.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Department, CreateDepartmentRequest } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private base = `${environment.apiUrl}/departments`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Department[]>(this.base); }
  create(body: CreateDepartmentRequest) { return this.http.post<Department>(this.base, body); }
  update(id: string, body: CreateDepartmentRequest) { return this.http.put<Department>(`${this.base}/${id}`, body); }
  delete(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
```

`frontend/src/app/core/services/user.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<User[]>(this.base); }
  getById(id: string) { return this.http.get<User>(`${this.base}/${id}`); }
  create(body: CreateUserRequest) { return this.http.post<User>(this.base, body); }
  update(id: string, body: UpdateUserRequest) { return this.http.put<User>(`${this.base}/${id}`, body); }
  deactivate(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
```

`frontend/src/app/core/services/report.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface LeaveSummary {
  userId: string;
  employeeName: string;
  department?: string;
  leaveTypeName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface AuditLog {
  id: string;
  employeeName: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = `${environment.apiUrl}/reports`;
  constructor(private http: HttpClient) {}

  getLeaveSummary(year?: number) {
    const params = year ? { year: year.toString() } : {};
    return this.http.get<LeaveSummary[]>(`${this.base}/leave-summary`, { params });
  }

  getAuditLogs(count = 100) {
    return this.http.get<AuditLog[]>(`${this.base}/audit-logs`, { params: { count: count.toString() } });
  }
}
```

- [ ] **Step 4: Verify build**

```bash
cd frontend && npx ng build
```
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/
git commit -m "add core models and services for all API endpoints"
```

---

### Task 3: Auth Interceptor and Route Guards

**Files:**
- Create: `frontend/src/app/core/interceptors/auth.interceptor.ts`
- Create: `frontend/src/app/core/guards/auth.guard.ts`
- Create: `frontend/src/app/core/guards/role.guard.ts`

- [ ] **Step 1: Create auth interceptor**

`frontend/src/app/core/interceptors/auth.interceptor.ts`:
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```

- [ ] **Step 2: Create auth guard (blocks unauthenticated users)**

`frontend/src/app/core/guards/auth.guard.ts`:
```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};
```

- [ ] **Step 3: Create role guard (blocks wrong roles)**

`frontend/src/app/core/guards/role.guard.ts`:
```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.role();
    if (role && allowedRoles.includes(role)) return true;
    return router.createUrlTree(['/unauthorized']);
  };
};
```

- [ ] **Step 4: Verify build**

```bash
cd frontend && npx ng build
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/interceptors/ frontend/src/app/core/guards/
git commit -m "add JWT interceptor and role-based route guards"
```

---

### Task 4: Shell Layout and Routing

**Files:**
- Create: `frontend/src/app/shared/components/shell/shell.ts`
- Create: `frontend/src/app/shared/components/shell/shell.html`
- Create: `frontend/src/app/shared/components/shell/shell.scss`
- Create: `frontend/src/app/shared/components/status-badge/status-badge.ts`
- Create: `frontend/src/app/shared/components/status-badge/status-badge.html`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `frontend/src/app/app.ts`
- Modify: `frontend/src/app/app.html`

- [ ] **Step 1: Create status badge shared component**

`frontend/src/app/shared/components/status-badge/status-badge.ts`:
```typescript
import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `<span class="badge" [ngClass]="status.toLowerCase()">{{ status }}</span>`,
  styles: [`
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .pending { background: #fff3cd; color: #856404; }
    .approved { background: #d1e7dd; color: #0a3622; }
    .rejected { background: #f8d7da; color: #58151c; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
}
```

- [ ] **Step 2: Create shell layout**

`frontend/src/app/shared/components/shell/shell.ts`:
```typescript
import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule,
    MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class ShellComponent {
  role = this.auth.role;
  user = this.auth.currentUser;

  constructor(private auth: AuthService) {}
  logout() { this.auth.logout(); }
}
```

`frontend/src/app/shared/components/shell/shell.html`:
```html
<mat-sidenav-container class="sidenav-container">
  <mat-sidenav mode="side" opened class="sidenav">
    <div class="nav-header">
      <span class="app-title">Leave Portal</span>
      <span class="user-role">{{ role() }}</span>
    </div>
    <mat-nav-list>
      @if (role() === 'Employee' || role() === 'Admin') {
        <a mat-list-item routerLink="/employee/dashboard" routerLinkActive="active">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a mat-list-item routerLink="/employee/apply" routerLinkActive="active">
          <mat-icon>add_circle</mat-icon> Apply for Leave
        </a>
        <a mat-list-item routerLink="/employee/history" routerLinkActive="active">
          <mat-icon>history</mat-icon> My Requests
        </a>
      }
      @if (role() === 'Manager' || role() === 'Admin') {
        <a mat-list-item routerLink="/manager/requests" routerLinkActive="active">
          <mat-icon>approval</mat-icon> Team Requests
        </a>
      }
      @if (role() === 'Admin') {
        <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
          <mat-icon>people</mat-icon> Users
        </a>
        <a mat-list-item routerLink="/admin/departments" routerLinkActive="active">
          <mat-icon>business</mat-icon> Departments
        </a>
        <a mat-list-item routerLink="/admin/leave-types" routerLinkActive="active">
          <mat-icon>event_note</mat-icon> Leave Types
        </a>
        <a mat-list-item routerLink="/admin/reports" routerLinkActive="active">
          <mat-icon>bar_chart</mat-icon> Reports
        </a>
      }
    </mat-nav-list>
    <div class="nav-footer">
      <button mat-button (click)="logout()">
        <mat-icon>logout</mat-icon> Logout
      </button>
    </div>
  </mat-sidenav>
  <mat-sidenav-content class="content">
    <router-outlet />
  </mat-sidenav-content>
</mat-sidenav-container>
```

`frontend/src/app/shared/components/shell/shell.scss`:
```scss
.sidenav-container { height: 100vh; }
.sidenav { width: 220px; padding: 0; }
.nav-header { padding: 16px; background: #3f51b5; color: white; }
.app-title { display: block; font-size: 18px; font-weight: 600; }
.user-role { font-size: 12px; opacity: 0.8; }
.nav-footer { position: absolute; bottom: 0; width: 100%; padding: 8px; }
.content { padding: 24px; }
a.active { background: rgba(63, 81, 181, 0.1); }
```

- [ ] **Step 3: Update app.routes.ts**

`frontend/src/app/app.routes.ts`:
```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './shared/components/shell/shell';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
  { path: 'unauthorized', loadComponent: () => import('./features/auth/unauthorized/unauthorized').then(m => m.UnauthorizedComponent) },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'employee/dashboard', pathMatch: 'full' },
      {
        path: 'employee',
        canActivate: [roleGuard(['Employee', 'Manager', 'Admin'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('./features/employee/dashboard/dashboard').then(m => m.EmployeeDashboardComponent) },
          { path: 'apply', loadComponent: () => import('./features/employee/apply/apply').then(m => m.ApplyLeaveComponent) },
          { path: 'history', loadComponent: () => import('./features/employee/history/history').then(m => m.LeaveHistoryComponent) },
        ]
      },
      {
        path: 'manager',
        canActivate: [roleGuard(['Manager', 'Admin'])],
        children: [
          { path: 'requests', loadComponent: () => import('./features/manager/requests/requests').then(m => m.ManagerRequestsComponent) },
        ]
      },
      {
        path: 'admin',
        canActivate: [roleGuard(['Admin'])],
        children: [
          { path: 'users', loadComponent: () => import('./features/admin/users/users').then(m => m.AdminUsersComponent) },
          { path: 'departments', loadComponent: () => import('./features/admin/departments/departments').then(m => m.AdminDepartmentsComponent) },
          { path: 'leave-types', loadComponent: () => import('./features/admin/leave-types/leave-types').then(m => m.AdminLeaveTypesComponent) },
          { path: 'reports', loadComponent: () => import('./features/admin/reports/reports').then(m => m.AdminReportsComponent) },
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
```

- [ ] **Step 4: Update app.ts and app.html**

`frontend/src/app/app.ts`:
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent {}
```

`frontend/src/app/app.html`:
```html
<router-outlet />
```

- [ ] **Step 5: Commit (before adding feature stubs)**

```bash
git add frontend/src/app/shared/ frontend/src/app/app.routes.ts frontend/src/app/app.ts frontend/src/app/app.html
git commit -m "add shell layout and route structure with guards"
```

---

### Task 5: Login Page

**Files:**
- Create: `frontend/src/app/features/auth/login/login.ts`
- Create: `frontend/src/app/features/auth/login/login.html`
- Create: `frontend/src/app/features/auth/login/login.scss`
- Create: `frontend/src/app/features/auth/unauthorized/unauthorized.ts`

- [ ] **Step 1: Create login component**

`frontend/src/app/features/auth/login/login.ts`:
```typescript
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value as { email: string; password: string }).subscribe({
      next: () => {
        const role = this.auth.role();
        if (role === 'Admin') this.router.navigate(['/admin/users']);
        else if (role === 'Manager') this.router.navigate(['/manager/requests']);
        else this.router.navigate(['/employee/dashboard']);
      },
      error: () => { this.error = 'Invalid email or password.'; this.loading = false; }
    });
  }
}
```

`frontend/src/app/features/auth/login/login.html`:
```html
<div class="login-container">
  <mat-card class="login-card">
    <mat-card-header>
      <mat-card-title>Leave Portal</mat-card-title>
      <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="current-password" />
        </mat-form-field>
        @if (error) {
          <p class="error">{{ error }}</p>
        }
        <button mat-raised-button color="primary" type="submit" [disabled]="loading" class="full-width">
          @if (loading) { <mat-spinner diameter="20" /> } @else { Sign In }
        </button>
      </form>
    </mat-card-content>
  </mat-card>
</div>
```

`frontend/src/app/features/auth/login/login.scss`:
```scss
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
.login-card { width: 400px; padding: 24px; }
.full-width { width: 100%; margin-bottom: 12px; }
.error { color: #d32f2f; font-size: 14px; }
```

- [ ] **Step 2: Create unauthorized page**

`frontend/src/app/features/auth/unauthorized/unauthorized.ts`:
```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div style="text-align:center; padding: 80px">
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <a mat-raised-button color="primary" routerLink="/login">Back to Login</a>
    </div>
  `
})
export class UnauthorizedComponent {}
```

- [ ] **Step 3: Build**

```bash
cd frontend && npx ng build
```
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/auth/
git commit -m "add login page and unauthorized page"
```

---

### Task 6: Employee Features (Dashboard, Apply, History)

**Files:**
- Create: `frontend/src/app/features/employee/dashboard/dashboard.ts`
- Create: `frontend/src/app/features/employee/dashboard/dashboard.html`
- Create: `frontend/src/app/features/employee/apply/apply.ts`
- Create: `frontend/src/app/features/employee/apply/apply.html`
- Create: `frontend/src/app/features/employee/history/history.ts`
- Create: `frontend/src/app/features/employee/history/history.html`

- [ ] **Step 1: Employee Dashboard — balance cards + pending requests**

`frontend/src/app/features/employee/dashboard/dashboard.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { LeaveBalanceService } from '../../../core/services/leave-balance.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveBalance } from '../../../core/models/leave-balance.model';
import { LeaveRequest } from '../../../core/models/leave-request.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink, NgFor, StatusBadgeComponent],
  templateUrl: './dashboard.html'
})
export class EmployeeDashboardComponent implements OnInit {
  balances: LeaveBalance[] = [];
  recentRequests: LeaveRequest[] = [];

  constructor(
    private balanceService: LeaveBalanceService,
    private requestService: LeaveRequestService) {}

  ngOnInit() {
    this.balanceService.getMine().subscribe(b => this.balances = b);
    this.requestService.getMine().subscribe(r => this.recentRequests = r.slice(0, 5));
  }
}
```

`frontend/src/app/features/employee/dashboard/dashboard.html`:
```html
<h2>My Dashboard</h2>

<h3>Leave Balances</h3>
<div class="balance-grid">
  @for (b of balances; track b.id) {
    <mat-card class="balance-card">
      <mat-card-header>
        <mat-card-title>{{ b.leaveTypeName }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="balance-numbers">
          <span class="remaining">{{ b.remainingDays }}</span>
          <span class="label">of {{ b.totalDays }} days remaining</span>
        </div>
      </mat-card-content>
    </mat-card>
  }
</div>

<div class="section-header">
  <h3>Recent Requests</h3>
  <a mat-button color="primary" routerLink="/employee/apply">+ Apply for Leave</a>
</div>

<div class="recent-list">
  @for (r of recentRequests; track r.id) {
    <mat-card class="request-row">
      <span>{{ r.leaveTypeName }}</span>
      <span>{{ r.startDate }} → {{ r.endDate }}</span>
      <span>{{ r.totalDays }} days</span>
      <app-status-badge [status]="r.status" />
    </mat-card>
  }
  @empty {
    <p>No requests yet. <a routerLink="/employee/apply">Apply for leave</a>.</p>
  }
</div>
```

- [ ] **Step 2: Apply for Leave form**

`frontend/src/app/features/employee/apply/apply.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { LeaveTypeService } from '../../../core/services/leave-type.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveType } from '../../../core/models/leave-type.model';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, NgFor, NgIf],
  templateUrl: './apply.html'
})
export class ApplyLeaveComponent implements OnInit {
  leaveTypes: LeaveType[] = [];
  error = '';
  success = false;

  form = this.fb.group({
    leaveTypeId: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
    employeeComment: ['']
  });

  constructor(
    private fb: FormBuilder,
    private leaveTypeService: LeaveTypeService,
    private requestService: LeaveRequestService,
    private router: Router) {}

  ngOnInit() {
    this.leaveTypeService.getAll().subscribe(types => this.leaveTypes = types.filter(t => t.isActive));
  }

  submit() {
    if (this.form.invalid) return;
    const { leaveTypeId, startDate, endDate, employeeComment } = this.form.value;
    const body = {
      leaveTypeId: leaveTypeId!,
      startDate: this.formatDate(startDate!),
      endDate: this.formatDate(endDate!),
      employeeComment: employeeComment ?? undefined
    };
    this.requestService.create(body).subscribe({
      next: () => this.router.navigate(['/employee/history']),
      error: err => this.error = err.error?.message ?? 'Failed to submit request.'
    });
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
```

`frontend/src/app/features/employee/apply/apply.html`:
```html
<mat-card style="max-width: 500px">
  <mat-card-header>
    <mat-card-title>Apply for Leave</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Leave Type</mat-label>
        <mat-select formControlName="leaveTypeId">
          @for (t of leaveTypes; track t.id) {
            <mat-option [value]="t.id">{{ t.name }} ({{ t.defaultDays }} days/yr)</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Start Date</mat-label>
        <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
        <mat-datepicker-toggle matIconSuffix [for]="startPicker" />
        <mat-datepicker #startPicker />
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>End Date</mat-label>
        <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
        <mat-datepicker-toggle matIconSuffix [for]="endPicker" />
        <mat-datepicker #endPicker />
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Comment (optional)</mat-label>
        <textarea matInput formControlName="employeeComment" rows="3"></textarea>
      </mat-form-field>

      @if (error) { <p style="color:red">{{ error }}</p> }

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
        Submit Request
      </button>
    </form>
  </mat-card-content>
</mat-card>
```

- [ ] **Step 3: Leave History with cancel action**

`frontend/src/app/features/employee/history/history.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveRequest } from '../../../core/models/leave-request.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule, StatusBadgeComponent],
  templateUrl: './history.html'
})
export class LeaveHistoryComponent implements OnInit {
  requests: LeaveRequest[] = [];
  columns = ['leaveType', 'dates', 'days', 'status', 'actions'];

  constructor(private requestService: LeaveRequestService) {}

  ngOnInit() { this.load(); }

  load() { this.requestService.getMine().subscribe(r => this.requests = r); }

  cancel(id: string) {
    if (!confirm('Cancel this leave request?')) return;
    this.requestService.cancel(id).subscribe(() => this.load());
  }
}
```

`frontend/src/app/features/employee/history/history.html`:
```html
<h2>My Leave Requests</h2>
<mat-card>
  <table mat-table [dataSource]="requests" style="width:100%">
    <ng-container matColumnDef="leaveType">
      <th mat-header-cell *matHeaderCellDef>Type</th>
      <td mat-cell *matCellDef="let r">{{ r.leaveTypeName }}</td>
    </ng-container>
    <ng-container matColumnDef="dates">
      <th mat-header-cell *matHeaderCellDef>Dates</th>
      <td mat-cell *matCellDef="let r">{{ r.startDate }} → {{ r.endDate }}</td>
    </ng-container>
    <ng-container matColumnDef="days">
      <th mat-header-cell *matHeaderCellDef>Days</th>
      <td mat-cell *matCellDef="let r">{{ r.totalDays }}</td>
    </ng-container>
    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>Status</th>
      <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status" /></td>
    </ng-container>
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef></th>
      <td mat-cell *matCellDef="let r">
        @if (r.status === 'Pending') {
          <button mat-button color="warn" (click)="cancel(r.id)">Cancel</button>
        }
      </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="columns"></tr>
    <tr mat-row *matRowDef="let row; columns: columns;"></tr>
  </table>
</mat-card>
```

- [ ] **Step 4: Build**

```bash
cd frontend && npx ng build
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/employee/
git commit -m "add employee dashboard, apply for leave form, and history page"
```

---

### Task 7: Manager Features

**Files:**
- Create: `frontend/src/app/features/manager/requests/requests.ts`
- Create: `frontend/src/app/features/manager/requests/requests.html`

- [ ] **Step 1: Manager requests page with approve/reject**

`frontend/src/app/features/manager/requests/requests.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveRequest } from '../../../core/models/leave-request.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-manager-requests',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, FormsModule, NgIf, StatusBadgeComponent],
  templateUrl: './requests.html'
})
export class ManagerRequestsComponent implements OnInit {
  requests: LeaveRequest[] = [];
  columns = ['employee', 'leaveType', 'dates', 'days', 'status', 'actions'];
  reviewComment = '';
  reviewingId: string | null = null;
  reviewAction: 'Approved' | 'Rejected' | null = null;

  constructor(private requestService: LeaveRequestService) {}

  ngOnInit() { this.load(); }
  load() { this.requestService.getTeam().subscribe(r => this.requests = r); }

  startReview(id: string, action: 'Approved' | 'Rejected') {
    this.reviewingId = id;
    this.reviewAction = action;
    this.reviewComment = '';
  }

  confirmReview() {
    if (!this.reviewingId || !this.reviewAction) return;
    this.requestService.review(this.reviewingId, {
      action: this.reviewAction,
      managerComment: this.reviewComment || undefined
    }).subscribe(() => {
      this.reviewingId = null;
      this.reviewAction = null;
      this.load();
    });
  }

  cancelReview() { this.reviewingId = null; this.reviewAction = null; }
}
```

`frontend/src/app/features/manager/requests/requests.html`:
```html
<h2>Team Leave Requests</h2>

@if (reviewingId) {
  <mat-card style="max-width:400px; margin-bottom:16px; background:#fff8e1">
    <mat-card-content>
      <p><strong>{{ reviewAction }} request</strong></p>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Comment (optional)</mat-label>
        <textarea matInput [(ngModel)]="reviewComment" rows="2"></textarea>
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="confirmReview()">Confirm</button>
      <button mat-button (click)="cancelReview()" style="margin-left:8px">Cancel</button>
    </mat-card-content>
  </mat-card>
}

<mat-card>
  <table mat-table [dataSource]="requests" style="width:100%">
    <ng-container matColumnDef="employee">
      <th mat-header-cell *matHeaderCellDef>Employee</th>
      <td mat-cell *matCellDef="let r">{{ r.employeeName }}</td>
    </ng-container>
    <ng-container matColumnDef="leaveType">
      <th mat-header-cell *matHeaderCellDef>Type</th>
      <td mat-cell *matCellDef="let r">{{ r.leaveTypeName }}</td>
    </ng-container>
    <ng-container matColumnDef="dates">
      <th mat-header-cell *matHeaderCellDef>Dates</th>
      <td mat-cell *matCellDef="let r">{{ r.startDate }} → {{ r.endDate }}</td>
    </ng-container>
    <ng-container matColumnDef="days">
      <th mat-header-cell *matHeaderCellDef>Days</th>
      <td mat-cell *matCellDef="let r">{{ r.totalDays }}</td>
    </ng-container>
    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>Status</th>
      <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status" /></td>
    </ng-container>
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef></th>
      <td mat-cell *matCellDef="let r">
        @if (r.status === 'Pending') {
          <button mat-button color="primary" (click)="startReview(r.id, 'Approved')">Approve</button>
          <button mat-button color="warn" (click)="startReview(r.id, 'Rejected')">Reject</button>
        }
      </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="columns"></tr>
    <tr mat-row *matRowDef="let row; columns: columns;"></tr>
  </table>
</mat-card>
```

- [ ] **Step 2: Build**

```bash
cd frontend && npx ng build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/manager/
git commit -m "add manager team requests page with approve/reject flow"
```

---

### Task 8: Admin Features (Users, Departments, Leave Types, Reports)

**Files:**
- Create: `frontend/src/app/features/admin/users/users.ts`
- Create: `frontend/src/app/features/admin/users/users.html`
- Create: `frontend/src/app/features/admin/departments/departments.ts`
- Create: `frontend/src/app/features/admin/departments/departments.html`
- Create: `frontend/src/app/features/admin/leave-types/leave-types.ts`
- Create: `frontend/src/app/features/admin/leave-types/leave-types.html`
- Create: `frontend/src/app/features/admin/reports/reports.ts`
- Create: `frontend/src/app/features/admin/reports/reports.html`

- [ ] **Step 1: Admin Users page**

`frontend/src/app/features/admin/users/users.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule, MatChipsModule, RouterLink],
  templateUrl: './users.html'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  columns = ['name', 'email', 'role', 'department', 'status', 'actions'];

  constructor(private userService: UserService) {}

  ngOnInit() { this.load(); }
  load() { this.userService.getAll().subscribe(u => this.users = u); }

  deactivate(id: string) {
    if (!confirm('Deactivate this user?')) return;
    this.userService.deactivate(id).subscribe(() => this.load());
  }
}
```

`frontend/src/app/features/admin/users/users.html`:
```html
<div style="display:flex; justify-content:space-between; align-items:center">
  <h2>Users</h2>
  <button mat-raised-button color="primary">+ Add User</button>
</div>
<mat-card>
  <table mat-table [dataSource]="users" style="width:100%">
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef>Name</th>
      <td mat-cell *matCellDef="let u">{{ u.firstName }} {{ u.lastName }}</td>
    </ng-container>
    <ng-container matColumnDef="email">
      <th mat-header-cell *matHeaderCellDef>Email</th>
      <td mat-cell *matCellDef="let u">{{ u.email }}</td>
    </ng-container>
    <ng-container matColumnDef="role">
      <th mat-header-cell *matHeaderCellDef>Role</th>
      <td mat-cell *matCellDef="let u">{{ u.role }}</td>
    </ng-container>
    <ng-container matColumnDef="department">
      <th mat-header-cell *matHeaderCellDef>Department</th>
      <td mat-cell *matCellDef="let u">{{ u.department ?? '—' }}</td>
    </ng-container>
    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>Status</th>
      <td mat-cell *matCellDef="let u">
        <mat-chip [color]="u.isActive ? 'primary' : 'warn'" highlighted>
          {{ u.isActive ? 'Active' : 'Inactive' }}
        </mat-chip>
      </td>
    </ng-container>
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef></th>
      <td mat-cell *matCellDef="let u">
        @if (u.isActive) {
          <button mat-button color="warn" (click)="deactivate(u.id)">Deactivate</button>
        }
      </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="columns"></tr>
    <tr mat-row *matRowDef="let row; columns: columns;"></tr>
  </table>
</mat-card>
```

- [ ] **Step 2: Admin Departments page**

`frontend/src/app/features/admin/departments/departments.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../core/models/department.model';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule],
  templateUrl: './departments.html'
})
export class AdminDepartmentsComponent implements OnInit {
  departments: Department[] = [];
  columns = ['name', 'actions'];
  form = this.fb.group({ name: ['', Validators.required] });
  editingId: string | null = null;

  constructor(private fb: FormBuilder, private deptService: DepartmentService) {}
  ngOnInit() { this.load(); }
  load() { this.deptService.getAll().subscribe(d => this.departments = d); }

  save() {
    if (this.form.invalid) return;
    const name = this.form.value.name!;
    const op = this.editingId
      ? this.deptService.update(this.editingId, { name })
      : this.deptService.create({ name });
    op.subscribe(() => { this.form.reset(); this.editingId = null; this.load(); });
  }

  edit(dept: Department) { this.editingId = dept.id; this.form.setValue({ name: dept.name }); }
}
```

`frontend/src/app/features/admin/departments/departments.html`:
```html
<h2>Departments</h2>
<mat-card style="max-width:400px; margin-bottom:16px">
  <mat-card-content>
    <form [formGroup]="form" (ngSubmit)="save()" style="display:flex; gap:8px; align-items:flex-start">
      <mat-form-field appearance="outline" style="flex:1">
        <mat-label>Department Name</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">
        {{ editingId ? 'Update' : 'Add' }}
      </button>
    </form>
  </mat-card-content>
</mat-card>
<mat-card>
  <table mat-table [dataSource]="departments" style="width:100%">
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef>Name</th>
      <td mat-cell *matCellDef="let d">{{ d.name }}</td>
    </ng-container>
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef></th>
      <td mat-cell *matCellDef="let d">
        <button mat-button (click)="edit(d)">Edit</button>
      </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="columns"></tr>
    <tr mat-row *matRowDef="let row; columns: columns;"></tr>
  </table>
</mat-card>
```

- [ ] **Step 3: Admin Leave Types page**

`frontend/src/app/features/admin/leave-types/leave-types.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { LeaveTypeService } from '../../../core/services/leave-type.service';
import { LeaveType } from '../../../core/models/leave-type.model';

@Component({
  selector: 'app-admin-leave-types',
  standalone: true,
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatChipsModule],
  templateUrl: './leave-types.html'
})
export class AdminLeaveTypesComponent implements OnInit {
  leaveTypes: LeaveType[] = [];
  columns = ['name', 'days', 'status', 'actions'];
  form = this.fb.group({ name: ['', Validators.required], defaultDays: [0, [Validators.required, Validators.min(1)]] });
  editingId: string | null = null;

  constructor(private fb: FormBuilder, private leaveTypeService: LeaveTypeService) {}
  ngOnInit() { this.load(); }
  load() { this.leaveTypeService.getAll().subscribe(t => this.leaveTypes = t); }

  save() {
    if (this.form.invalid) return;
    const { name, defaultDays } = this.form.value;
    const op = this.editingId
      ? this.leaveTypeService.update(this.editingId, { name: name!, defaultDays: defaultDays!, isActive: true })
      : this.leaveTypeService.create({ name: name!, defaultDays: defaultDays! });
    op.subscribe(() => { this.form.reset(); this.editingId = null; this.load(); });
  }

  edit(lt: LeaveType) { this.editingId = lt.id; this.form.setValue({ name: lt.name, defaultDays: lt.defaultDays }); }

  deactivate(id: string) {
    this.leaveTypeService.deactivate(id).subscribe(() => this.load());
  }
}
```

`frontend/src/app/features/admin/leave-types/leave-types.html`:
```html
<h2>Leave Types</h2>
<mat-card style="max-width:450px; margin-bottom:16px">
  <mat-card-content>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Default Days/Year</mat-label>
        <input matInput type="number" formControlName="defaultDays" />
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">{{ editingId ? 'Update' : 'Add' }}</button>
    </form>
  </mat-card-content>
</mat-card>
<mat-card>
  <table mat-table [dataSource]="leaveTypes" style="width:100%">
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef>Name</th>
      <td mat-cell *matCellDef="let t">{{ t.name }}</td>
    </ng-container>
    <ng-container matColumnDef="days">
      <th mat-header-cell *matHeaderCellDef>Days/Year</th>
      <td mat-cell *matCellDef="let t">{{ t.defaultDays }}</td>
    </ng-container>
    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>Status</th>
      <td mat-cell *matCellDef="let t">
        <mat-chip [color]="t.isActive ? 'primary' : 'warn'" highlighted>{{ t.isActive ? 'Active' : 'Inactive' }}</mat-chip>
      </td>
    </ng-container>
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef></th>
      <td mat-cell *matCellDef="let t">
        <button mat-button (click)="edit(t)">Edit</button>
        @if (t.isActive) {
          <button mat-button color="warn" (click)="deactivate(t.id)">Deactivate</button>
        }
      </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="columns"></tr>
    <tr mat-row *matRowDef="let row; columns: columns;"></tr>
  </table>
</mat-card>
```

- [ ] **Step 4: Admin Reports page**

`frontend/src/app/features/admin/reports/reports.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { ReportService, LeaveSummary, AuditLog } from '../../../core/services/report.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [MatTableModule, MatTabsModule, MatCardModule, DatePipe],
  templateUrl: './reports.html'
})
export class AdminReportsComponent implements OnInit {
  summaries: LeaveSummary[] = [];
  auditLogs: AuditLog[] = [];
  summaryColumns = ['employee', 'department', 'leaveType', 'total', 'used', 'remaining'];
  auditColumns = ['timestamp', 'employee', 'action', 'entity'];

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.reportService.getLeaveSummary().subscribe(s => this.summaries = s);
    this.reportService.getAuditLogs().subscribe(l => this.auditLogs = l);
  }
}
```

`frontend/src/app/features/admin/reports/reports.html`:
```html
<h2>Reports</h2>
<mat-tab-group>
  <mat-tab label="Leave Summary">
    <mat-card style="margin-top:16px">
      <table mat-table [dataSource]="summaries" style="width:100%">
        <ng-container matColumnDef="employee">
          <th mat-header-cell *matHeaderCellDef>Employee</th>
          <td mat-cell *matCellDef="let s">{{ s.employeeName }}</td>
        </ng-container>
        <ng-container matColumnDef="department">
          <th mat-header-cell *matHeaderCellDef>Department</th>
          <td mat-cell *matCellDef="let s">{{ s.department ?? '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="leaveType">
          <th mat-header-cell *matHeaderCellDef>Leave Type</th>
          <td mat-cell *matCellDef="let s">{{ s.leaveTypeName }}</td>
        </ng-container>
        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let s">{{ s.totalDays }}</td>
        </ng-container>
        <ng-container matColumnDef="used">
          <th mat-header-cell *matHeaderCellDef>Used</th>
          <td mat-cell *matCellDef="let s">{{ s.usedDays }}</td>
        </ng-container>
        <ng-container matColumnDef="remaining">
          <th mat-header-cell *matHeaderCellDef>Remaining</th>
          <td mat-cell *matCellDef="let s">{{ s.remainingDays }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="summaryColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: summaryColumns;"></tr>
      </table>
    </mat-card>
  </mat-tab>

  <mat-tab label="Audit Log">
    <mat-card style="margin-top:16px">
      <table mat-table [dataSource]="auditLogs" style="width:100%">
        <ng-container matColumnDef="timestamp">
          <th mat-header-cell *matHeaderCellDef>Time</th>
          <td mat-cell *matCellDef="let l">{{ l.createdAt | date:'short' }}</td>
        </ng-container>
        <ng-container matColumnDef="employee">
          <th mat-header-cell *matHeaderCellDef>User</th>
          <td mat-cell *matCellDef="let l">{{ l.employeeName }}</td>
        </ng-container>
        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Action</th>
          <td mat-cell *matCellDef="let l">{{ l.action }}</td>
        </ng-container>
        <ng-container matColumnDef="entity">
          <th mat-header-cell *matHeaderCellDef>Entity</th>
          <td mat-cell *matCellDef="let l">{{ l.entityType }} {{ l.entityId }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="auditColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: auditColumns;"></tr>
      </table>
    </mat-card>
  </mat-tab>
</mat-tab-group>
```

- [ ] **Step 5: Build**

```bash
cd frontend && npx ng build
```
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/features/admin/
git commit -m "add admin pages: users, departments, leave types, reports"
```

---

### Task 9: Vercel Deployment Config

**Files:**
- Create: `frontend/vercel.json`

- [ ] **Step 1: Add vercel.json for Angular SPA routing**

`frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This tells Vercel to serve `index.html` for all routes so Angular's client-side router works correctly.

- [ ] **Step 2: Set production API URL**

The production API URL will be set as a Vercel environment variable named `API_URL`. Update `environment.prod.ts` to use it:

`frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: (window as any).__env?.apiUrl ?? 'https://your-render-api.onrender.com/api'
};
```

For now, the Render URL isn't known — replace `your-render-api` when deploying.

- [ ] **Step 3: Final build**

```bash
cd frontend && npx ng build --configuration production
```
Expected: 0 errors, dist/ folder produced

- [ ] **Step 4: Commit and push**

```bash
git add frontend/
git commit -m "add Vercel config and production environment setup"
git push origin feat/api-implementation
```
