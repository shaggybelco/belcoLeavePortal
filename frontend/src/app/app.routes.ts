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
