import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LeaveType, CreateLeaveTypeRequest, UpdateLeaveTypeRequest } from '../models/leave-type.model';

@Injectable({ providedIn: 'root' })
export class LeaveTypeService {
  private base = `${environment.apiUrl}/leave-types`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<LeaveType[]>(this.base); }
  create(body: CreateLeaveTypeRequest) { return this.http.post<LeaveType>(this.base, body); }
  update(id: string, body: UpdateLeaveTypeRequest) { return this.http.put<LeaveType>(`${this.base}/${id}`, body); }
  deactivate(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
