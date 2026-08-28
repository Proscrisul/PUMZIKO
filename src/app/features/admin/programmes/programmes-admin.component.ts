import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminProgramme } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { ConfirmButtonComponent } from '../../../shared/admin/confirm-button.component';

@Component({
  selector: 'app-admin-programmes',
  imports: [LucideDynamicIcon, ConfirmButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .card { border: 1px solid var(--hairline); border-radius: 3px; padding: 18px; background: #fff; margin-bottom: 14px; }
    .card.unsafe { border-color: var(--ember); }
    .top { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
    .top .name { flex: 1; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
    .checks { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; }
    .warn { color: var(--ember); font-size: 0.85rem; margin-top: 8px; }
  `],
  template: `
    <h1 class="admin-h1">Programmes</h1>
    <p class="admin-sub">All future tense until you move a status on. Two involve minors.</p>

    @for (p of items(); track p.id) {
      <div class="card" [class.unsafe]="!p.safe_to_run">
        <div class="top">
          <input class="input name" [value]="p.name" (change)="patch(p, {name: $any($event.target).value})" />
          <select class="select" style="width:150px" [value]="p.status"
                  (change)="patch(p, {status: $any($event.target).value})">
            <option value="Planned">Planned</option>
            <option value="StartingSoon">Starting soon</option>
            <option value="Running">Running</option>
          </select>
          <app-confirm-button (confirmed)="remove(p)" />
        </div>

        <textarea class="textarea" [value]="p.blurb" placeholder="Short description"
                  (change)="patch(p, {blurb: $any($event.target).value})"></textarea>

        <div class="grid">
          <label><span class="admin-label">External link</span>
            <input class="input" [value]="p.external_url" placeholder="https://…"
                   (change)="patch(p, {external_url: $any($event.target).value})" /></label>
          <label><span class="admin-label">Order</span>
            <input class="input" type="number" [value]="p.ordering"
                   (change)="patch(p, {ordering: +$any($event.target).value})" /></label>
        </div>
        <label style="display:block;margin-top:12px"><span class="admin-label">Starts note</span>
          <input class="input" [value]="p.starts_note"
                 (change)="patch(p, {starts_note: $any($event.target).value})" /></label>

        <div class="checks">
          <label class="admin-check"><input type="checkbox" [checked]="p.is_published"
            (change)="patch(p, {is_published: $any($event.target).checked})" /> Published</label>
          <label class="admin-check"><input type="checkbox" [checked]="p.involves_minors"
            (change)="patch(p, {involves_minors: $any($event.target).checked})" /> Involves minors</label>
          <label class="admin-check"><input type="checkbox" [checked]="p.child_protection_policy_ready"
            (change)="patch(p, {child_protection_policy_ready: $any($event.target).checked})" /> Child protection policy ready</label>
        </div>
        @if (!p.safe_to_run) {
          <p class="warn">Involves minors and the child protection policy is not marked ready — do not advertise as running.</p>
        }
      </div>
    }

    <button class="btn-ghost btn-sm" (click)="add()">
      <svg lucideIcon="plus" [size]="15"></svg> Add programme
    </button>
  `,
})
export class ProgrammesAdminComponent {
  private admin = inject(AdminApiService);
  private toast = inject(AdminToastService);
  readonly items = signal<AdminProgramme[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.admin.programmes.list().subscribe(list =>
      this.items.set([...list].sort((a, b) => a.ordering - b.ordering)),
    );
  }

  patch(row: AdminProgramme, body: Partial<AdminProgramme>): void {
    this.admin.programmes.update(row.id, body).subscribe({
      next: () => { this.toast.ok('Updated'); this.load(); },
      error: () => this.toast.error(),
    });
  }

  add(): void {
    this.admin.programmes.create({
      name: 'New programme', status: 'Planned', ordering: this.items().length + 1,
    }).subscribe({ next: () => this.load(), error: () => this.toast.error() });
  }

  remove(row: AdminProgramme): void {
    this.admin.programmes.remove(row.id).subscribe({ next: () => this.load(), error: () => this.toast.error() });
  }
}
