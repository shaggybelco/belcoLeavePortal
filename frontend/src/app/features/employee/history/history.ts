import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveRequest } from '../../../core/models/leave-request.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule,
    MatIconModule, StatusBadgeComponent, LoadingComponent],
  templateUrl: './history.html'
})
export class LeaveHistoryComponent implements OnInit {
  private requestService = inject(LeaveRequestService);
  private dialog         = inject(MatDialog);

  requests: LeaveRequest[] = [];
  columns = ['leaveType', 'dates', 'days', 'status', 'actions'];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.requestService.getMine().subscribe(r => {
      this.requests = r;
      this.loading  = false;
    });
  }

  cancel(request: LeaveRequest) {
    this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title:        'Cancel Leave Request',
        message:      `Are you sure you want to cancel your ${request.leaveTypeName} request for ${request.startDate} → ${request.endDate}?`,
        confirmLabel: 'Cancel Request',
        confirmColor: 'warn',
        icon:         'event_busy',
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.requestService.cancel(request.id).subscribe(() => this.load());
    });
  }
}
