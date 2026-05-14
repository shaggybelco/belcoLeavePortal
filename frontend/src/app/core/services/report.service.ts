import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface LeaveSummary {
  userId: string;
  employeeName: string;
  department?: string;
  leaveTypeName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface AuditLog {
  id: string;
  employeeName: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = `${environment.apiUrl}/reports`;
  constructor(private http: HttpClient) {}

  getLeaveSummary(year?: number) {
    if (year) {
      return this.http.get<LeaveSummary[]>(`${this.base}/leave-summary`, { params: { year: year.toString() } });
    }
    return this.http.get<LeaveSummary[]>(`${this.base}/leave-summary`);
  }

  getAuditLogs(count = 100) {
    return this.http.get<AuditLog[]>(`${this.base}/audit-logs`, { params: { count: count.toString() } });
  }
}
