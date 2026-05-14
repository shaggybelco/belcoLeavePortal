import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/models/user.model';
import { Department } from '../../../core/models/department.model';

export interface UserFormData {
  user?: User;
  departments: Department[];
  managers: User[];
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="form-dialog">
      <div class="form-dialog-header">
        <div class="form-dialog-icon">
          <mat-icon>{{ data.user ? 'edit' : 'person_add' }}</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>{{ data.user ? 'Edit User' : 'Add Employee' }}</h2>
          <p>{{ data.user ? 'Update employee details' : 'Create a new employee account' }}</p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="dialog-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Email Address</mat-label>
            <mat-icon matPrefix>mail_outline</mat-icon>
            <input matInput type="email" formControlName="email" [readonly]="!!data.user" />
          </mat-form-field>

          @if (!data.user) {
            <mat-form-field appearance="outline" class="full">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock_outline</mat-icon>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
          }

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="Employee">Employee</mat-option>
                <mat-option value="Manager">Manager</mat-option>
                <mat-option value="Admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select formControlName="departmentId">
                <mat-option [value]="null">— None —</mat-option>
                @for (d of data.departments; track d.id) {
                  <mat-option [value]="d.id">{{ d.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Manager</mat-label>
            <mat-select formControlName="managerId">
              <mat-option [value]="null">— None —</mat-option>
              @for (m of data.managers; track m.id) {
                <mat-option [value]="m.id">{{ m.firstName }} {{ m.lastName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="ref.close(null)">Cancel</button>
        <button mat-flat-button class="save-btn" [disabled]="form.invalid" (click)="save()">
          <mat-icon>{{ data.user ? 'save' : 'person_add' }}</mat-icon>
          {{ data.user ? 'Save Changes' : 'Create Employee' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .form-dialog { width: 520px; }

    .form-dialog-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 24px 0;
    }

    .form-dialog-icon {
      width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }
    }

    h2[mat-dialog-title] {
      margin: 0; padding: 0; font-size: 1.1rem; font-weight: 700; line-height: 1.2;
    }

    .form-dialog-header p { margin: 2px 0 0; font-size: .82rem; color: #64748b; }

    mat-dialog-content { padding: 20px 24px !important; }

    .dialog-form { display: flex; flex-direction: column; gap: 4px; }

    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }

    .full { width: 100%; }

    mat-form-field { width: 100%; }

    mat-dialog-actions {
      padding: 8px 24px 20px !important;
      display: flex; justify-content: flex-end; gap: 10px;

      button { border-radius: 8px !important; font-weight: 600; }
    }

    .save-btn {
      background: #6366f1 !important; color: white !important;
      display: flex; align-items: center; gap: 6px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `]
})
export class UserFormDialogComponent {
  data = inject<UserFormData>(MAT_DIALOG_DATA);
  ref  = inject(MatDialogRef<UserFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    firstName:    [this.data.user?.firstName ?? '',  Validators.required],
    lastName:     [this.data.user?.lastName  ?? '',  Validators.required],
    email:        [this.data.user?.email     ?? '',  [Validators.required, Validators.email]],
    password:     ['', this.data.user ? [] : Validators.required],
    role:         [this.data.user?.role      ?? 'Employee', Validators.required],
    departmentId: [this.data.user?.departmentId ?? null as string | null],
    managerId:    [this.data.user?.managerId    ?? null as string | null],
  });

  save() {
    if (this.form.invalid) return;
    this.ref.close(this.form.value);
  }
}
