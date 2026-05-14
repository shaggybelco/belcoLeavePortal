import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveRequest } from '../../../core/models/leave-request.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-manager-requests',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, FormsModule, StatusBadgeComponent],
  templateUrl: './requests.html'
})
export class ManagerRequestsComponent implements OnInit {
  requests: LeaveRequest[] = [];
  columns = ['employee', 'leaveType', 'dates', 'days', 'status', 'actions'];
  reviewComment = '';
  reviewingId: string | null = null;
  reviewAction: 'Approved' | 'Rejected' | null = null;

  constructor(private requestService: LeaveRequestService) {}

  ngOnInit() { this.load(); }
  load() { this.requestService.getTeam().subscribe(r => this.requests = r); }

  startReview(id: string, action: 'Approved' | 'Rejected') {
    this.reviewingId = id;
    this.reviewAction = action;
    this.reviewComment = '';
  }

  confirmReview() {
    if (!this.reviewingId || !this.reviewAction) return;
    this.requestService.review(this.reviewingId, {
      action: this.reviewAction,
      managerComment: this.reviewComment || undefined
    }).subscribe(() => {
      this.reviewingId = null;
      this.reviewAction = null;
      this.load();
    });
  }

  cancelReview() { this.reviewingId = null; this.reviewAction = null; }
}
