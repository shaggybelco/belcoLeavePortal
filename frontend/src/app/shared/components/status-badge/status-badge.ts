import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `<span class="badge" [ngClass]="status.toLowerCase()">{{ status }}</span>`,
  styles: [`
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .pending { background: #fff3cd; color: #856404; }
    .approved { background: #d1e7dd; color: #0a3622; }
    .rejected { background: #f8d7da; color: #58151c; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
}
