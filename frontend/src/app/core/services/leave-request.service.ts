import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LeaveRequest, CreateLeaveRequestRequest, ReviewLeaveRequestRequest } from '../models/leave-request.model';

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private base = `${environment.apiUrl}/leave-requests`;
  constructor(private http: HttpClient) {}

  getMine() { return this.http.get<LeaveRequest[]>(`${this.base}/my`); }
  getTeam() { return this.http.get<LeaveRequest[]>(`${this.base}/team`); }
  getAll() { return this.http.get<LeaveRequest[]>(this.base); }
  create(body: CreateLeaveRequestRequest) { return this.http.post<LeaveRequest>(this.base, body); }
  review(id: string, body: ReviewLeaveRequestRequest) { return this.http.put<LeaveRequest>(`${this.base}/${id}/review`, body); }
  cancel(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
