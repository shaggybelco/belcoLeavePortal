import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LeaveBalance } from '../models/leave-balance.model';

@Injectable({ providedIn: 'root' })
export class LeaveBalanceService {
  private base = `${environment.apiUrl}/leave-balances`;
  constructor(private http: HttpClient) {}

  getMine(year?: number) {
    if (year) {
      return this.http.get<LeaveBalance[]>(this.base, { params: { year: year.toString() } });
    }
    return this.http.get<LeaveBalance[]>(this.base);
  }

  getForUser(userId: string, year?: number) {
    if (year) {
      return this.http.get<LeaveBalance[]>(this.base, { params: { userId, year: year.toString() } });
    }
    return this.http.get<LeaveBalance[]>(this.base, { params: { userId } });
  }
}
