import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule, MatChipsModule],
  templateUrl: './users.html'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  columns = ['name', 'email', 'role', 'department', 'status', 'actions'];

  constructor(private userService: UserService) {}

  ngOnInit() { this.load(); }
  load() { this.userService.getAll().subscribe(u => this.users = u); }

  deactivate(id: string) {
    if (!confirm('Deactivate this user?')) return;
    this.userService.deactivate(id).subscribe(() => this.load());
  }
}
