import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminToastService } from './toast.service';

@Component({
  selector: 'app-admin-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      position: fixed; right: 20px; bottom: 20px; z-index: 100;
      display: flex; flex-direction: column; gap: 8px;
    }
    .toast {
      padding: 12px 16px; border-radius: 3px; font-weight: 600; font-size: 0.9rem;
      background: var(--ink); color: var(--bone);
      box-shadow: 0 6px 20px rgba(26,21,18,0.25);
    }
    .toast.error { background: var(--ember); }
  `],
  template: `
    @for (t of toasts(); track t.id) {
      <div class="toast" [class.error]="t.kind === 'error'" (click)="dismiss(t.id)">
        {{ t.text }}
      </div>
    }
  `,
})
export class AdminToastComponent {
  private svc = inject(AdminToastService);
  readonly toasts = this.svc.toasts;
  dismiss = (id: number) => this.svc.dismiss(id);
}
