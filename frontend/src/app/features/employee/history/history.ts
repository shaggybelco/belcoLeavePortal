import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveRequest } from '../../../core/models/leave-request.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule, StatusBadgeComponent],
  templateUrl: './history.html'
})
export class LeaveHistoryComponent implements OnInit {
  requests: LeaveRequest[] = [];
  columns = ['leaveType', 'dates', 'days', 'status', 'actions'];

  constructor(private requestService: LeaveRequestService) {}

  ngOnInit() { this.load(); }

  load() { this.requestService.getMine().subscribe(r => this.requests = r); }

  cancel(id: string) {
    if (!confirm('Cancel this leave request?')) return;
    this.requestService.cancel(id).subscribe(() => this.load());
  }
}
