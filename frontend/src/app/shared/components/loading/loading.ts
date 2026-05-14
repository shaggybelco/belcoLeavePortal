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
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      gap: 16px;
      color: #94a3b8;

      p { margin: 0; font-size: .9rem; }

      mat-spinner {
        --mdc-circular-progress-active-indicator-color: #6366f1;
      }
    }
  `]
})
export class LoadingComponent {
  @Input() message = 'Loading...';
}
