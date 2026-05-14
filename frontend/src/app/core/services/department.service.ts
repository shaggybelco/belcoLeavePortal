import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Department, CreateDepartmentRequest } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private base = `${environment.apiUrl}/departments`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Department[]>(this.base); }
  create(body: CreateDepartmentRequest) { return this.http.post<Department>(this.base, body); }
  update(id: string, body: CreateDepartmentRequest) { return this.http.put<Department>(`${this.base}/${id}`, body); }
  delete(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
