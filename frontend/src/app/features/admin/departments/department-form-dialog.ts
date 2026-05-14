import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Department } from '../../../core/models/department.model';

export interface DepartmentFormData {
  department?: Department;
}

@Component({
  selector: 'app-department-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="form-dialog">
      <div class="form-dialog-header">
        <div class="form-dialog-icon">
          <mat-icon>{{ data.department ? 'edit' : 'domain_add' }}</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>{{ data.department ? 'Edit Department' : 'Add Department' }}</h2>
          <p>{{ data.department ? 'Update department details' : 'Create a new department' }}</p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="dialog-form">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Department Name</mat-label>
            <mat-icon matPrefix>domain</mat-icon>
            <input matInput formControlName="name" placeholder="e.g. Engineering" />
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="ref.close(null)">Cancel</button>
        <button mat-flat-button class="save-btn" [disabled]="form.invalid" (click)="save()">
          <mat-icon>{{ data.department ? 'save' : 'add' }}</mat-icon>
          {{ data.department ? 'Save Changes' : 'Add Department' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .form-dialog { width: 420px; }

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

    .full { width: 100%; }

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
export class DepartmentFormDialogComponent {
  data = inject<DepartmentFormData>(MAT_DIALOG_DATA);
  ref  = inject(MatDialogRef<DepartmentFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: [this.data.department?.name ?? '', Validators.required],
  });

  save() {
    if (this.form.invalid) return;
    this.ref.close(this.form.value);
  }
}
