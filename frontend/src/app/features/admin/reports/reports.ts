import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { ReportService, LeaveSummary, AuditLog } from '../../../core/services/report.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [MatTableModule, MatTabsModule, MatCardModule, DatePipe],
  templateUrl: './reports.html'
})
export class AdminReportsComponent implements OnInit {
  summaries: LeaveSummary[] = [];
  auditLogs: AuditLog[] = [];
  summaryColumns = ['employee', 'department', 'leaveType', 'total', 'used', 'remaining'];
  auditColumns = ['timestamp', 'employee', 'action', 'entity'];

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.reportService.getLeaveSummary().subscribe(s => this.summaries = s);
    this.reportService.getAuditLogs().subscribe(l => this.auditLogs = l);
  }
}
