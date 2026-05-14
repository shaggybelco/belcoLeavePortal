import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

const matchPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const np  = group.get('newPassword')?.value;
  const cnp = group.get('confirmPassword')?.value;
  return np && cnp && np !== cnp ? { mismatch: true } : null;
};

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="form-dialog">
      <div class="form-dialog-header">
        <div class="form-dialog-icon">
          <mat-icon>lock_reset</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>Change Password</h2>
          <p>Enter your current password to set a new one</p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="dialog-form">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Current Password</mat-label>
            <mat-icon matPrefix>lock_outline</mat-icon>
            <input matInput [type]="showCurrent ? 'text' : 'password'" formControlName="currentPassword" />
            <button mat-icon-button matSuffix type="button" (click)="showCurrent = !showCurrent">
              <mat-icon>{{ showCurrent ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>New Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput [type]="showNew ? 'text' : 'password'" formControlName="newPassword" />
            <button mat-icon-button matSuffix type="button" (click)="showNew = !showNew">
              <mat-icon>{{ showNew ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('newPassword')?.hasError('minlength')) {
              <mat-error>At least 6 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Confirm New Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput [type]="showConfirm ? 'text' : 'password'" formControlName="confirmPassword" />
            <button mat-icon-button matSuffix type="button" (click)="showConfirm = !showConfirm">
              <mat-icon>{{ showConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
              <mat-error>Passwords do not match</mat-error>
            }
          </mat-form-field>

          @if (error) {
            <div class="error-banner">
              <mat-icon>error_outline</mat-icon>
              {{ error }}
            </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="ref.close(false)">Cancel</button>
        <button mat-flat-button class="save-btn"
          [disabled]="form.invalid || saving"
          (click)="save()">
          <mat-icon>{{ saving ? 'hourglass_empty' : 'check' }}</mat-icon>
          {{ saving ? 'Saving...' : 'Update Password' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .form-dialog { width: 440px; }

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

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: #fef2f2; color: #ef4444;
      border: 1px solid #fecaca; border-radius: 8px;
      padding: 10px 14px; font-size: .875rem;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    }

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
export class ChangePasswordDialogComponent {
  ref     = inject(MatDialogRef<ChangePasswordDialogComponent>);
  private auth = inject(AuthService);
  private fb   = inject(FormBuilder);

  showCurrent = false;
  showNew     = false;
  showConfirm = false;
  saving      = false;
  error       = '';

  form = this.fb.group({
    currentPassword:  ['', Validators.required],
    newPassword:      ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword:  ['', Validators.required],
  }, { validators: matchPasswords });

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.error  = '';
    const { currentPassword, newPassword } = this.form.value;
    this.auth.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => { this.saving = false; this.ref.close(true); },
      error: err => {
        this.saving = false;
        this.error = err.error?.message ?? 'Failed to update password.';
      }
    });
  }
}
