import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'warn' | 'primary';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-icon" [class]="data.confirmColor ?? 'warn'">
        <mat-icon>{{ data.icon ?? 'warning_amber' }}</mat-icon>
      </div>

      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="ref.close(false)">Cancel</button>
        <button mat-flat-button
          [class]="'confirm-btn ' + (data.confirmColor ?? 'warn')"
          (click)="ref.close(true)">
          {{ data.confirmLabel ?? 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      padding: 8px 8px 0;
      text-align: center;
      max-width: 380px;
    }

    .dialog-icon {
      width: 56px; height: 56px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;

      mat-icon { font-size: 28px; width: 28px; height: 28px; }

      &.warn    { background: #fee2e2; mat-icon { color: #ef4444; } }
      &.primary { background: #e0e7ff; mat-icon { color: #6366f1; } }
    }

    h2[mat-dialog-title] {
      font-size: 1.1rem; font-weight: 700;
      margin: 0 0 4px; padding: 0;
      text-align: center;
    }

    mat-dialog-content p {
      color: #64748b; font-size: .9rem;
      margin: 0; text-align: center;
    }

    mat-dialog-actions {
      display: flex; gap: 10px; justify-content: center;
      padding: 20px 0 8px !important;

      button {
        min-width: 110px; border-radius: 8px !important;
        font-weight: 600;
      }
    }

    .confirm-btn {
      &.warn    { background: #ef4444 !important; color: white !important; }
      &.primary { background: #6366f1 !important; color: white !important; }
    }
  `]
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  ref  = inject(MatDialogRef<ConfirmDialogComponent>);
}
