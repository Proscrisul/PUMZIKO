import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminSaturdayPart } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { SaveBarComponent } from '../../../shared/admin/save-bar.component';
import { ConfirmButtonComponent } from '../../../shared/admin/confirm-button.component';

@Component({
  selector: 'app-admin-saturday',
  imports: [ReactiveFormsModule, LucideDynamicIcon, SaveBarComponent, ConfirmButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="admin-h1">The shape of a Saturday</h1>
    <p class="admin-sub">Seven parts, in order. "Asking questions" is the headline.</p>

    <table class="admin-table">
      <thead><tr><th>#</th><th>Label</th><th>Time</th><th>Description</th><th>Headline</th><th></th></tr></thead>
      <tbody>
        @for (p of parts(); track p.id) {
          <tr>
            <td style="width:56px"><input class="input" type="number" [value]="p.ordering" (change)="edit(p, {ordering: +$any($event.target).value})" /></td>
            <td><input class="input" [value]="p.label" (change)="edit(p, {label: $any($event.target).value})" /></td>
            <td style="width:130px"><input class="input" [value]="p.time_label" placeholder="10:00" (change)="edit(p, {time_label: $any($event.target).value})" /></td>
            <td><input class="input" [value]="p.description" (change)="edit(p, {description: $any($event.target).value})" /></td>
            <td><input type="checkbox" [checked]="p.is_headline" (change)="edit(p, {is_headline: $any($event.target).checked})" /></td>
            <td><app-confirm-button (confirmed)="remove(p)" /></td>
          </tr>
        }
      </tbody>
    </table>
    <button class="btn-ghost btn-sm" style="margin-top:12px" (click)="add()">
      <svg lucideIcon="plus" [size]="15"></svg> Add part
    </button>

    <hr class="hairline" style="margin:36px 0 24px" />

    <h2 class="admin-h1" style="font-size:1.4rem">"This week at Pumziko"</h2>
    <p class="admin-sub">Shown on the home page after launch instead of the launch date.</p>
    <form class="admin-form" [formGroup]="note">
      <label><span class="admin-label">Heading</span><input class="input" formControlName="heading" /></label>
      <label><span class="admin-label">Body</span><textarea class="textarea" formControlName="body"></textarea></label>
      <label class="admin-check"><input type="checkbox" formControlName="is_published" /> Published</label>
      <app-save-bar [dirty]="note.dirty" [saving]="saving()" (save)="saveNote()" (discard)="loadNote()" />
    </form>
  `,
})
export class SaturdayComponent {
  private admin = inject(AdminApiService);
  private fb = inject(FormBuilder);
  private toast = inject(AdminToastService);

  readonly parts = signal<AdminSaturdayPart[]>([]);
  readonly saving = signal(false);
  note = this.fb.group({ heading: [''], body: [''], is_published: [false] });

  constructor() { this.loadParts(); this.loadNote(); }

  loadParts(): void {
    this.admin.saturdayParts.list().subscribe(list =>
      this.parts.set([...list].sort((a, b) => a.ordering - b.ordering)),
    );
  }

  edit(row: AdminSaturdayPart, patch: Partial<AdminSaturdayPart>): void {
    this.admin.saturdayParts.update(row.id, patch).subscribe({
      next: () => { this.toast.ok('Updated'); this.loadParts(); },
      error: () => this.toast.error(),
    });
  }

  add(): void {
    this.admin.saturdayParts.create({ label: 'New part', ordering: this.parts().length + 1 }).subscribe({
      next: () => this.loadParts(), error: () => this.toast.error(),
    });
  }

  remove(row: AdminSaturdayPart): void {
    this.admin.saturdayParts.remove(row.id).subscribe({
      next: () => this.loadParts(), error: () => this.toast.error(),
    });
  }

  loadNote(): void {
    this.admin.getWeekNote().subscribe(n => this.note.reset(n));
  }

  saveNote(): void {
    this.saving.set(true);
    this.admin.patchWeekNote(this.note.getRawValue() as never).subscribe({
      next: () => { this.saving.set(false); this.note.markAsPristine(); this.toast.ok(); },
      error: () => { this.saving.set(false); this.toast.error(); },
    });
  }
}
