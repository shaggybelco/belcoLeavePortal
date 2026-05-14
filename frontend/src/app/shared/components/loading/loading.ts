import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-wrapper">
      <mat-spinner diameter="40" />
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-wrapper {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 48px 24px; gap: 16px;
      color: #64748b;
      p { margin: 0; font-size: .9rem; }
    }
  `]
})
export class LoadingComponent {
  @Input() message = 'Loading...';
}
