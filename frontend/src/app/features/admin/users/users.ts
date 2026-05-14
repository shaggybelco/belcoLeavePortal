import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { DepartmentService } from '../../../core/services/department.service';
import { User } from '../../../core/models/user.model';
import { Department } from '../../../core/models/department.model';
import { UserFormDialogComponent, UserFormData } from './user-form-dialog';
import { ResetPasswordDialogComponent } from './reset-password-dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule,
    MatIconModule, MatChipsModule],
  templateUrl: './users.html'
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);
  private deptService = inject(DepartmentService);
  private dialog      = inject(MatDialog);

  users: User[] = [];
  departments: Department[] = [];
  managers: User[] = [];
  columns = ['name', 'email', 'role', 'department', 'status', 'actions'];

  ngOnInit() {
    this.deptService.getAll().subscribe(d => this.departments = d);
    this.load();
  }

  load() {
    this.userService.getAll().subscribe(u => {
      this.users    = u;
      this.managers = u.filter(m => m.role === 'Manager' || m.role === 'Admin');
    });
  }

  openAdd() {
    this.dialog.open<UserFormDialogComponent, UserFormData>(UserFormDialogComponent, {
      data: { departments: this.departments, managers: this.managers }
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.userService.create({
        firstName:    result.firstName,
        lastName:     result.lastName,
        email:        result.email,
        password:     result.password,
        role:         result.role,
        departmentId: result.departmentId ?? undefined,
        managerId:    result.managerId    ?? undefined,
      }).subscribe(() => this.load());
    });
  }

  openEdit(u: User) {
    this.dialog.open<UserFormDialogComponent, UserFormData>(UserFormDialogComponent, {
      data: { user: u, departments: this.departments, managers: this.managers }
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.userService.update(u.id, {
        firstName:    result.firstName,
        lastName:     result.lastName,
        role:         result.role,
        departmentId: result.departmentId ?? undefined,
        managerId:    result.managerId    ?? undefined,
        isActive:     true,
      }).subscribe(() => this.load());
    });
  }

  openResetPassword(u: User) {
    this.dialog.open<ResetPasswordDialogComponent, User>(ResetPasswordDialogComponent, {
      data: u
    });
  }

  deactivate(u: User) {
    this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title:        'Deactivate User',
        message:      `Are you sure you want to deactivate ${u.firstName} ${u.lastName}?`,
        confirmLabel: 'Deactivate',
        confirmColor: 'warn',
        icon:         'person_off',
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.userService.deactivate(u.id).subscribe(() => this.load());
    });
  }
}
