import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveRequest } from '../../../core/models/leave-request.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { ReviewDialogComponent } from './review-dialog';

@Component({
  selector: 'app-manager-requests',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule,
    MatIconModule, StatusBadgeComponent, LoadingComponent],
  templateUrl: './requests.html'
})
export class ManagerRequestsComponent implements OnInit {
  private requestService = inject(LeaveRequestService);
  private auth           = inject(AuthService);
  private dialog         = inject(MatDialog);

  requests: LeaveRequest[] = [];
  columns = ['employee', 'leaveType', 'dates', 'days', 'status', 'actions'];
  loading = true;

  get isAdmin() { return this.auth.role() === 'Admin'; }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const obs = this.auth.role() === 'Admin'
      ? this.requestService.getAll()
      : this.requestService.getTeam();
    obs.subscribe(r => { this.requests = r; this.loading = false; });
  }

  review(r: LeaveRequest, action: 'Approved' | 'Rejected') {
    this.dialog.open(ReviewDialogComponent, {
      width: '460px',
      data: {
        action,
        employeeName: r.employeeName,
        leaveType:    r.leaveTypeName,
        dates:        `${r.startDate} → ${r.endDate}`,
        days:         r.totalDays
      }
    }).afterClosed().subscribe((comment: string | null) => {
      if (comment === null) return;
      this.requestService.review(r.id, { action, managerComment: comment || undefined })
        .subscribe(() => this.load());
    });
  }
}
