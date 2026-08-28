import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminPerson } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { ConfirmButtonComponent } from '../../../shared/admin/confirm-button.component';
import { ImagePickerComponent } from '../../../shared/admin/image-picker.component';

@Component({
  selector: 'app-admin-people',
  imports: [LucideDynamicIcon, ConfirmButtonComponent, ImagePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .card { border: 1px solid var(--hairline); border-radius: 3px; padding: 18px; background: #fff; margin-bottom: 14px; }
    .top { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
    .top .name { flex: 1; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 90px; gap: 12px; margin-top: 12px; }
    .photo { margin-top: 12px; }
  `],
  template: `
    <h1 class="admin-h1">People</h1>
    <p class="admin-sub">A face lowers fear more than a form does.</p>

    @for (p of items(); track p.id) {
      <div class="card">
        <div class="top">
          <input class="input name" [value]="p.name" (change)="patch(p, {name: $any($event.target).value})" />
          <input class="input" style="width:220px" [value]="p.role_title" placeholder="Role"
                 (change)="patch(p, {role_title: $any($event.target).value})" />
          <app-confirm-button (confirmed)="remove(p)" />
        </div>
        <textarea class="textarea" [value]="p.bio" placeholder="Bio"
                  (change)="patch(p, {bio: $any($event.target).value})"></textarea>
        <div class="grid">
          <label class="admin-check"><input type="checkbox" [checked]="p.is_published"
            (change)="patch(p, {is_published: $any($event.target).checked})" /> Published</label>
          <label><span class="admin-label">Order</span>
            <input class="input" type="number" [value]="p.ordering"
                   (change)="patch(p, {ordering: +$any($event.target).value})" /></label>
        </div>
        <div class="photo">
          <span class="admin-label">Photo</span>
          <app-image-picker [current]="p.photo" (picked)="setPhoto(p, $event)" />
        </div>
      </div>
    }

    <button class="btn-ghost btn-sm" (click)="add()">
      <svg lucideIcon="plus" [size]="15"></svg> Add person
    </button>
  `,
})
export class PeopleComponent {
  private admin = inject(AdminApiService);
  private toast = inject(AdminToastService);
  readonly items = signal<AdminPerson[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.admin.people.list().subscribe(list =>
      this.items.set([...list].sort((a, b) => a.ordering - b.ordering)),
    );
  }

  patch(row: AdminPerson, body: Partial<AdminPerson>): void {
    this.admin.people.update(row.id, body).subscribe({
      next: () => { this.toast.ok('Updated'); this.load(); },
      error: () => this.toast.error(),
    });
  }

  setPhoto(row: AdminPerson, file: File | null): void {
    const fd = new FormData();
    if (file) fd.append('photo', file);
    else fd.append('photo', '');
    this.admin.people.update(row.id, fd).subscribe({
      next: () => { this.toast.ok('Photo saved'); this.load(); },
      error: () => this.toast.error(),
    });
  }

  add(): void {
    this.admin.people.create({ name: 'New person', ordering: this.items().length + 1 }).subscribe({
      next: () => this.load(), error: () => this.toast.error(),
    });
  }

  remove(row: AdminPerson): void {
    this.admin.people.remove(row.id).subscribe({ next: () => this.load(), error: () => this.toast.error() });
  }
}
