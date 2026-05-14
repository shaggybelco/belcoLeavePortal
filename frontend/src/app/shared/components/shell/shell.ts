import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class ShellComponent {
  private auth = inject(AuthService);
  loading      = inject(LoadingService);

  role     = this.auth.role;
  email    = computed(() => this.auth.currentUser()?.email ?? '');
  initials = computed(() => {
    const e = this.auth.currentUser()?.email ?? '';
    return e.slice(0, 2).toUpperCase();
  });

  logout() { this.auth.logout(); }
}
