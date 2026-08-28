import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminEnquiry } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';

@Component({
  selector: 'app-admin-enquiries',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .filters { display: flex; gap: 10px; margin-bottom: 16px; }
    .filters select { width: auto; }
    .msg { color: var(--ink-70); white-space: pre-wrap; max-width: 46ch; }
    .who { font-weight: 600; }
    .empty { color: var(--ink-55); padding: 24px 0; }
  `],
  template: `
    <h1 class="admin-h1">Enquiries</h1>
    <p class="admin-sub">Everything from the contact form and "ask us anything". Reply within a day.</p>

    <div class="filters">
      <select class="select" [value]="handled()" (change)="setHandled($any($event.target).value)">
        <option value="">All</option>
        <option value="false">To answer</option>
        <option value="true">Handled</option>
      </select>
      <select class="select" [value]="source()" (change)="setSource($any($event.target).value)">
        <option value="">Any page</option>
        <option value="Contact">Contact</option>
        <option value="WhatToExpect">What to expect</option>
        <option value="Programme">Programmes</option>
        <option value="Visit">Visit</option>
      </select>
    </div>

    <table class="admin-table">
      <thead><tr><th>When</th><th>From</th><th>Reach on</th><th>Message</th><th>Page</th><th></th></tr></thead>
      <tbody>
        @for (e of rows(); track e.id) {
          <tr>
            <td>{{ e.created_at | date:'d MMM, HH:mm' }}</td>
            <td class="who">{{ e.name || '—' }}</td>
            <td>{{ e.contact_method }}: {{ e.contact_value }}</td>
            <td class="msg">{{ e.message || '—' }}</td>
            <td><span class="admin-pill">{{ e.source }}</span></td>
            <td>
              @if (e.handled) {
                <button class="btn-ghost btn-sm" (click)="unhandle(e)">Reopen</button>
              } @else {
                <button class="btn btn-sm" (click)="handle(e)">Mark handled</button>
              }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="6" class="empty">Nothing here.</td></tr>
        }
      </tbody>
    </table>
  `,
})
export class EnquiriesComponent {
  private admin = inject(AdminApiService);
  private toast = inject(AdminToastService);

  readonly rows = signal<AdminEnquiry[]>([]);
  readonly handled = signal('false');
  readonly source = signal('');

  constructor() { this.load(); }

  load(): void {
    const params: Record<string, string> = {};
    if (this.handled()) params['handled'] = this.handled();
    if (this.source()) params['source'] = this.source();
    this.admin.enquiries(params).subscribe(p => this.rows.set(p.results));
  }

  setHandled(v: string) { this.handled.set(v); this.load(); }
  setSource(v: string) { this.source.set(v); this.load(); }

  handle(e: AdminEnquiry): void {
    this.admin.markEnquiryHandled(e.id).subscribe({
      next: () => { this.toast.ok('Marked handled'); this.load(); }, error: () => this.toast.error(),
    });
  }
  unhandle(e: AdminEnquiry): void {
    this.admin.markEnquiryUnhandled(e.id).subscribe({
      next: () => { this.toast.ok('Reopened'); this.load(); }, error: () => this.toast.error(),
    });
  }
}
