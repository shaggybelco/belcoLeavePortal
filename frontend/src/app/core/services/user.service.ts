import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<User[]>(this.base); }
  getById(id: string) { return this.http.get<User>(`${this.base}/${id}`); }
  create(body: CreateUserRequest) { return this.http.post<User>(this.base, body); }
  update(id: string, body: UpdateUserRequest) { return this.http.put<User>(`${this.base}/${id}`, body); }
  deactivate(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
