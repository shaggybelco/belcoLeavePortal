import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div style="text-align:center; padding: 80px">
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <a mat-raised-button color="primary" routerLink="/login">Back to Login</a>
    </div>
  `
})
export class UnauthorizedComponent {}
