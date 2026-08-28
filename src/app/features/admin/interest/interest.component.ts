import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminProgrammeInterest } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';

@Component({
  selector: 'app-admin-interest',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .filters { display: flex; gap: 10px; margin-bottom: 16px; }
    .filters select { width: auto; }
    .empty { color: var(--ink-55); padding: 24px 0; }
  `],
  template: `
    <h1 class="admin-h1">Programme interest</h1>
    <p class="admin-sub">Who is waiting for what — the one list. Useful before choosing what to launch second.</p>

    <div class="filters">
      <select class="select" [value]="notified()" (change)="setNotified($any($event.target).value)">
        <option value="">All</option>
        <option value="false">Not yet told</option>
        <option value="true">Told</option>
      </select>
    </div>

    <table class="admin-table">
      <thead><tr><th>When</th><th>Programme</th><th>Name</th><th>Reach on</th><th></th></tr></thead>
      <tbody>
        @for (r of rows(); track r.id) {
          <tr>
            <td>{{ r.created_at | date:'d MMM, HH:mm' }}</td>
            <td class="who" style="font-weight:600">{{ r.programme_name }}</td>
            <td>{{ r.name || '—' }}</td>
            <td>{{ r.contact_method }}: {{ r.contact_value }}</td>
            <td>
              @if (r.notified) {
                <span class="admin-pill ok">Told</span>
              } @else {
                <button class="btn btn-sm" (click)="notify(r)">Mark told</button>
              }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="5" class="empty">Nothing here.</td></tr>
        }
      </tbody>
    </table>
  `,
})
export class InterestComponent {
  private admin = inject(AdminApiService);
  private toast = inject(AdminToastService);

  readonly rows = signal<AdminProgrammeInterest[]>([]);
  readonly notified = signal('false');

  constructor() { this.load(); }

  load(): void {
    const params: Record<string, string> = {};
    if (this.notified()) params['notified'] = this.notified();
    this.admin.programmeInterest(params).subscribe(p => this.rows.set(p.results));
  }

  setNotified(v: string) { this.notified.set(v); this.load(); }

  notify(r: AdminProgrammeInterest): void {
    this.admin.markInterestNotified(r.id).subscribe({
      next: () => { this.toast.ok('Marked told'); this.load(); }, error: () => this.toast.error(),
    });
  }
}
