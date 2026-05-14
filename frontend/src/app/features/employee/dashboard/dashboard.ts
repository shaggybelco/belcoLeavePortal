import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { LeaveBalanceService } from '../../../core/services/leave-balance.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveBalance } from '../../../core/models/leave-balance.model';
import { LeaveRequest } from '../../../core/models/leave-request.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class EmployeeDashboardComponent implements OnInit {
  balances: LeaveBalance[] = [];
  recentRequests: LeaveRequest[] = [];

  constructor(
    private balanceService: LeaveBalanceService,
    private requestService: LeaveRequestService) {}

  ngOnInit() {
    this.balanceService.getMine().subscribe(b => this.balances = b);
    this.requestService.getMine().subscribe(r => this.recentRequests = r.slice(0, 5));
  }
}
