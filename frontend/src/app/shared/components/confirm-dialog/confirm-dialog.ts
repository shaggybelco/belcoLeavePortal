import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'primary' | 'warn' | 'accent';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon" [class]="'icon-' + (data.confirmColor ?? 'primary')">
        <mat-icon>{{ data.icon ?? 'help_outline' }}</mat-icon>
      </div>

      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="ref.close(false)">Cancel</button>
        <button mat-flat-button
          [class]="'confirm-btn confirm-' + (data.confirmColor ?? 'primary')"
          (click)="ref.close(true)">
          {{ data.confirmLabel ?? 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      width: 380px;
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .confirm-icon {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }

    .icon-primary { background: #ede9fe; mat-icon { color: #6366f1; } }
    .icon-warn    { background: #fee2e2; mat-icon { color: #ef4444; } }
    .icon-accent  { background: #fef3c7; mat-icon { color: #f59e0b; } }

    h2[mat-dialog-title] {
      margin: 0 0 8px; padding: 0;
      font-size: 1.1rem; font-weight: 700;
    }

    mat-dialog-content p {
      margin: 0; color: #64748b; font-size: .9rem; line-height: 1.5;
    }

    mat-dialog-actions {
      display: flex; justify-content: center; gap: 12px;
      padding: 20px 0 0 !important; margin: 0 !important;
      button { border-radius: 8px !important; font-weight: 600; min-width: 100px; }
    }

    .confirm-primary { background: #6366f1 !important; color: white !important; }
    .confirm-warn    { background: #ef4444 !important; color: white !important; }
    .confirm-accent  { background: #f59e0b !important; color: white !important; }
  `]
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  ref  = inject(MatDialogRef<ConfirmDialogComponent>);
}
