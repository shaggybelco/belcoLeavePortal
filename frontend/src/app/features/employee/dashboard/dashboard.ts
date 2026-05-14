import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LeaveBalanceService } from '../../../core/services/leave-balance.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveBalance } from '../../../core/models/leave-balance.model';
import { LeaveRequest } from '../../../core/models/leave-request.model';

const LEAVE_COLORS: Record<string, string> = {
  'Annual Leave':             '#6366f1',
  'Sick Leave':               '#f59e0b',
  'Family Responsibility':    '#22c55e',
  'Study Leave':              '#3b82f6',
};

const LEAVE_ICONS: Record<string, string> = {
  'Annual Leave':             'beach_access',
  'Sick Leave':               'medical_services',
  'Family Responsibility':    'family_restroom',
  'Study Leave':              'school',
};

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class EmployeeDashboardComponent implements OnInit {
  private balanceService = inject(LeaveBalanceService);
  private requestService = inject(LeaveRequestService);

  balances: LeaveBalance[] = [];
  recentRequests: LeaveRequest[] = [];
  year = new Date().getFullYear();

  ngOnInit() {
    this.balanceService.getMine().subscribe(b => this.balances = b);
    this.requestService.getMine().subscribe(r => this.recentRequests = r.slice(0, 5));
  }

  colorFor(name: string) { return LEAVE_COLORS[name] ?? '#6366f1'; }
  iconFor(name: string)  { return LEAVE_ICONS[name]  ?? 'event_note'; }
  pct(remaining: number, total: number) {
    if (total === 0) return 0;
    return Math.round((remaining / total) * 100);
  }
}
