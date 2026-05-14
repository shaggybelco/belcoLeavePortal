import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { DepartmentService } from '../../../core/services/department.service';
import { User } from '../../../core/models/user.model';
import { Department } from '../../../core/models/department.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatTableModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule
  ],
  templateUrl: './users.html'
})
export class AdminUsersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private deptService = inject(DepartmentService);
  private dialog = inject(MatDialog);

  users: User[] = [];
  departments: Department[] = [];
  managers: User[] = [];
  columns = ['name', 'email', 'role', 'department', 'status', 'actions'];
  editingId: string | null = null;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['Employee', Validators.required],
    departmentId: [null as string | null],
    managerId: [null as string | null]
  });

  ngOnInit() {
    this.load();
    this.deptService.getAll().subscribe(d => this.departments = d);
  }

  load() {
    this.userService.getAll().subscribe(u => {
      this.users = u;
      this.managers = u.filter(m => m.role === 'Manager' || m.role === 'Admin');
    });
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;

    if (this.editingId) {
      this.userService.update(this.editingId, {
        firstName: v.firstName!,
        lastName: v.lastName!,
        role: v.role!,
        departmentId: v.departmentId ?? undefined,
        managerId: v.managerId ?? undefined,
        isActive: true
      }).subscribe(() => { this.cancelEdit(); this.load(); });
    } else {
      this.userService.create({
        firstName: v.firstName!,
        lastName: v.lastName!,
        email: v.email!,
        password: v.password!,
        role: v.role!,
        departmentId: v.departmentId ?? undefined,
        managerId: v.managerId ?? undefined
      }).subscribe(() => { this.form.reset({ role: 'Employee' }); this.load(); });
    }
  }

  edit(u: User) {
    this.editingId = u.id;
    this.form.patchValue({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      departmentId: u.departmentId ?? null,
      managerId: u.managerId ?? null
    });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ role: 'Employee' });
    this.form.get('password')!.setValidators(Validators.required);
    this.form.get('password')!.updateValueAndValidity();
  }

  deactivate(id: string) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Deactivate User',
        message: 'This user will lose access to the portal immediately. You can reactivate them later by editing their profile.',
        confirmLabel: 'Deactivate',
        confirmColor: 'warn',
        icon: 'person_off'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.userService.deactivate(id).subscribe(() => this.load());
    });
  }
}
