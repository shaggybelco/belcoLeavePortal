import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface ReviewDialogData {
  action: 'Approved' | 'Rejected';
  employeeName: string;
  leaveType: string;
  dates: string;
  days: number;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-icon" [class]="data.action === 'Approved' ? 'approve' : 'reject'">
        <mat-icon>{{ data.action === 'Approved' ? 'check_circle' : 'cancel' }}</mat-icon>
      </div>

      <h2 mat-dialog-title>{{ data.action === 'Approved' ? 'Approve' : 'Reject' }} Leave Request</h2>

      <mat-dialog-content>
        <div class="request-summary">
          <div class="summary-row">
            <mat-icon>person</mat-icon>
            <span>{{ data.employeeName }}</span>
          </div>
          <div class="summary-row">
            <mat-icon>event_note</mat-icon>
            <span>{{ data.leaveType }}</span>
          </div>
          <div class="summary-row">
            <mat-icon>date_range</mat-icon>
            <span>{{ data.dates }} &bull; {{ data.days }} day{{ data.days !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <mat-form-field appearance="outline" class="comment-field">
          <mat-label>Comment (optional)</mat-label>
          <textarea matInput [(ngModel)]="comment" rows="3"
            placeholder="{{ data.action === 'Approved' ? 'Add an approval note...' : 'Reason for rejection...' }}">
          </textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="ref.close(null)">Cancel</button>
        <button mat-flat-button
          [class]="'confirm-btn ' + (data.action === 'Approved' ? 'approve' : 'reject')"
          (click)="ref.close(comment)">
          {{ data.action === 'Approved' ? 'Approve Request' : 'Reject Request' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper { padding: 8px 8px 0; max-width: 420px; }

    .dialog-icon {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
      &.approve { background: #dcfce7; mat-icon { color: #22c55e; } }
      &.reject  { background: #fee2e2; mat-icon { color: #ef4444; } }
    }

    h2[mat-dialog-title] {
      font-size: 1.1rem; font-weight: 700;
      margin: 0 0 16px; padding: 0; text-align: center;
    }

    .request-summary {
      background: #f8fafc; border-radius: 10px;
      padding: 14px 16px; margin-bottom: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .summary-row {
      display: flex; align-items: center; gap: 10px;
      font-size: .875rem; color: #334155;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #94a3b8; }
    }

    .comment-field { width: 100%; }

    mat-dialog-actions {
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 12px 0 8px !important;

      button {
        min-width: 130px; border-radius: 8px !important; font-weight: 600;
      }
    }

    .confirm-btn {
      &.approve { background: #22c55e !important; color: white !important; }
      &.reject  { background: #ef4444 !important; color: white !important; }
    }
  `]
})
export class ReviewDialogComponent {
  data    = inject<ReviewDialogData>(MAT_DIALOG_DATA);
  ref     = inject(MatDialogRef<ReviewDialogComponent>);
  comment = '';
}
