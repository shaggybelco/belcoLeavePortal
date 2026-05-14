import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LeaveRequest } from '../../../core/models/leave-request.model';

export interface ReviewDialogData {
  request: LeaveRequest;
  action: 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="review-dialog">
      <div class="review-header" [class.approve]="data.action === 'Approved'" [class.reject]="data.action === 'Rejected'">
        <div class="review-icon">
          <mat-icon>{{ data.action === 'Approved' ? 'check_circle' : 'cancel' }}</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>{{ data.action === 'Approved' ? 'Approve Request' : 'Reject Request' }}</h2>
          <p>{{ data.action === 'Approved' ? 'This will notify the employee.' : 'Please provide a reason below.' }}</p>
        </div>
      </div>

      <mat-dialog-content>
        <div class="request-summary">
          <div class="summary-row">
            <mat-icon>person</mat-icon>
            <span>{{ data.request.employeeName }}</span>
          </div>
          <div class="summary-row">
            <mat-icon>beach_access</mat-icon>
            <span>{{ data.request.leaveTypeName }}</span>
          </div>
          <div class="summary-row">
            <mat-icon>date_range</mat-icon>
            <span>{{ data.request.startDate }} → {{ data.request.endDate }}
              <strong>({{ data.request.totalDays }} day{{ data.request.totalDays !== 1 ? 's' : '' }})</strong>
            </span>
          </div>
          @if (data.request.employeeComment) {
            <div class="summary-row">
              <mat-icon>chat_bubble_outline</mat-icon>
              <span>{{ data.request.employeeComment }}</span>
            </div>
          }
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Comment {{ data.action === 'Rejected' ? '(required)' : '(optional)' }}</mat-label>
          <mat-icon matPrefix>comment</mat-icon>
          <textarea matInput [(ngModel)]="comment" rows="3"
            placeholder="{{ data.action === 'Rejected' ? 'Explain why this request is being rejected...' : 'Add a note for the employee...' }}">
          </textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="ref.close(null)">Cancel</button>
        <button mat-flat-button
          [class]="data.action === 'Approved' ? 'approve-btn' : 'reject-btn'"
          [disabled]="data.action === 'Rejected' && !comment.trim()"
          (click)="confirm()">
          <mat-icon>{{ data.action === 'Approved' ? 'check' : 'close' }}</mat-icon>
          {{ data.action === 'Approved' ? 'Approve' : 'Reject' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .review-dialog { width: 480px; }

    .review-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px 24px 0;
      &.approve .review-icon { background: linear-gradient(135deg, #22c55e, #16a34a); }
      &.reject  .review-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
    }

    .review-icon {
      width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }
    }

    h2[mat-dialog-title] {
      margin: 0; padding: 0; font-size: 1.1rem; font-weight: 700; line-height: 1.2;
    }

    .review-header p { margin: 2px 0 0; font-size: .82rem; color: #64748b; }

    mat-dialog-content { padding: 20px 24px !important; }

    .request-summary {
      background: #f8fafc; border-radius: 10px;
      padding: 14px 16px; margin-bottom: 16px;
      display: flex; flex-direction: column; gap: 8px;
    }

    .summary-row {
      display: flex; align-items: center; gap: 10px;
      font-size: .875rem; color: #374151;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #6366f1; flex-shrink: 0; }
    }

    .full { width: 100%; }

    mat-dialog-actions {
      padding: 8px 24px 20px !important;
      display: flex; justify-content: flex-end; gap: 10px;
      button { border-radius: 8px !important; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    }

    .approve-btn { background: #22c55e !important; color: white !important; }
    .reject-btn  { background: #ef4444 !important; color: white !important; }
  `]
})
export class ReviewDialogComponent {
  data    = inject<ReviewDialogData>(MAT_DIALOG_DATA);
  ref     = inject(MatDialogRef<ReviewDialogComponent>);
  comment = '';

  confirm() {
    this.ref.close({ comment: this.comment || undefined });
  }
}
