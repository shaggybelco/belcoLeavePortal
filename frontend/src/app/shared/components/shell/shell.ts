import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ChangePasswordDialogComponent } from '../../components/change-password-dialog/change-password-dialog';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class ShellComponent {
  private auth   = inject(AuthService);
  private dialog = inject(MatDialog);
  loading        = inject(LoadingService);

  role     = this.auth.role;
  email    = computed(() => this.auth.currentUser()?.email ?? '');
  initials = computed(() => {
    const e = this.auth.currentUser()?.email ?? '';
    return e.slice(0, 2).toUpperCase();
  });

  openChangePassword() {
    this.dialog.open(ChangePasswordDialogComponent);
  }

  logout() { this.auth.logout(); }
}
