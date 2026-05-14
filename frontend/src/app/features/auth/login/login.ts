import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

const DEMO_ACCOUNTS = {
  admin:    { email: 'admin@belco.co.za',           password: 'Admin@1234' },
  manager:  { email: 'thabo.nkosi@belco.co.za',      password: 'Manager@1234' },
  employee: { email: 'lebo.mokoena@belco.co.za',    password: 'Employee@1234' },
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading  = false;
  error    = '';
  showPass = false;

  quickLogin(role: 'admin' | 'manager' | 'employee') {
    const creds = DEMO_ACCOUNTS[role];
    this.form.setValue(creds);
    this.submit();
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error   = '';
    this.auth.login(this.form.value as { email: string; password: string }).subscribe({
      next: () => {
        const role = this.auth.role();
        if (role === 'Admin')   this.router.navigate(['/admin/users']);
        else if (role === 'Manager') this.router.navigate(['/manager/requests']);
        else this.router.navigate(['/employee/dashboard']);
      },
      error: () => { this.error = 'Invalid email or password.'; this.loading = false; }
    });
  }
}
