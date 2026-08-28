import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminSocialLink } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { SaveBarComponent } from '../../../shared/admin/save-bar.component';
import { ConfirmButtonComponent } from '../../../shared/admin/confirm-button.component';

@Component({
  selector: 'app-admin-site',
  imports: [ReactiveFormsModule, LucideDynamicIcon, SaveBarComponent, ConfirmButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="admin-h1">Site settings</h1>
    <p class="admin-sub">The values that appear across every page.</p>

    <form class="admin-form" [formGroup]="form">
      <div class="row2">
        <label><span class="admin-label">Church name</span><input class="input" formControlName="church_name" /></label>
        <label><span class="admin-label">Tagline</span><input class="input" formControlName="tagline" /></label>
      </div>
      <div class="row2">
        <label><span class="admin-label">Gathering day</span><input class="input" formControlName="gathering_day" /></label>
        <label><span class="admin-label">Neighbourhood</span><input class="input" formControlName="neighbourhood_label" /></label>
      </div>
      <div class="row2">
        <label><span class="admin-label">Starts</span><input class="input" type="time" formControlName="gathering_start" /></label>
        <label><span class="admin-label">Ends</span><input class="input" type="time" formControlName="gathering_end" /></label>
      </div>
      <div class="row2">
        <label><span class="admin-label">Launch date</span><input class="input" type="date" formControlName="launch_date" /></label>
        <label>
          <span class="admin-label">Launch mode</span>
          <select class="select" formControlName="launch_mode">
            <option value="PreLaunch">Before launch — show the date</option>
            <option value="ThisWeek">After launch — show "This week"</option>
          </select>
        </label>
      </div>
      <div class="row2">
        <label><span class="admin-label">WhatsApp number</span><input class="input" formControlName="whatsapp_number" placeholder="+254…" /></label>
        <label><span class="admin-label">Contact email</span><input class="input" type="email" formControlName="contact_email" /></label>
      </div>
      <label><span class="admin-label">Reply promise</span><input class="input" formControlName="reply_promise" /></label>

      <app-save-bar [dirty]="form.dirty" [saving]="saving()" (save)="save()" (discard)="load()" />
    </form>

    <hr class="hairline" style="margin:36px 0 24px" />

    <h2 class="admin-h1" style="font-size:1.4rem">Social links</h2>
    <p class="admin-sub">Only "active" links show on the site.</p>
    <table class="admin-table">
      <thead><tr><th>Platform</th><th>Handle</th><th>URL</th><th>Active</th><th>Order</th><th></th></tr></thead>
      <tbody>
        @for (s of social(); track s.id) {
          <tr>
            <td>{{ s.platform }}</td>
            <td><input class="input" [value]="s.handle" (change)="edit(s, 'handle', $any($event.target).value)" /></td>
            <td><input class="input" [value]="s.url" (change)="edit(s, 'url', $any($event.target).value)" /></td>
            <td><input type="checkbox" [checked]="s.is_active" (change)="edit(s, 'is_active', $any($event.target).checked)" /></td>
            <td style="width:70px"><input class="input" type="number" [value]="s.ordering" (change)="edit(s, 'ordering', +$any($event.target).value)" /></td>
            <td><app-confirm-button (confirmed)="removeSocial(s)" /></td>
          </tr>
        }
      </tbody>
    </table>
    <button class="btn-ghost btn-sm" style="margin-top:12px" (click)="addSocial()">
      <svg lucideIcon="plus" [size]="15"></svg> Add platform
    </button>
  `,
})
export class SiteComponent {
  private admin = inject(AdminApiService);
  private fb = inject(FormBuilder);
  private toast = inject(AdminToastService);

  readonly saving = signal(false);
  readonly social = signal<AdminSocialLink[]>([]);

  form = this.fb.group({
    church_name: [''], tagline: [''],
    gathering_day: [''], neighbourhood_label: [''],
    gathering_start: [''], gathering_end: [''],
    launch_date: <string | null>null, launch_mode: ['PreLaunch'],
    whatsapp_number: [''], contact_email: [''], reply_promise: [''],
  });

  constructor() {
    this.load();
    this.loadSocial();
  }

  load(): void {
    this.admin.getSiteSettings().subscribe(s => {
      this.form.reset({
        ...s,
        gathering_start: s.gathering_start?.slice(0, 5),
        gathering_end: s.gathering_end?.slice(0, 5),
      });
    });
  }

  save(): void {
    this.saving.set(true);
    this.admin.patchSiteSettings(this.form.getRawValue() as never).subscribe({
      next: () => { this.saving.set(false); this.form.markAsPristine(); this.toast.ok(); },
      error: () => { this.saving.set(false); this.toast.error(); },
    });
  }

  loadSocial(): void {
    this.admin.socialLinks.list().subscribe(list => this.social.set(list));
  }

  edit(row: AdminSocialLink, key: keyof AdminSocialLink, value: unknown): void {
    this.admin.socialLinks.update(row.id, { [key]: value } as never).subscribe({
      next: () => this.toast.ok('Updated'),
      error: () => this.toast.error(),
    });
  }

  addSocial(): void {
    const used = new Set(this.social().map(s => s.platform));
    const next = (['TikTok', 'Facebook', 'YouTube', 'Instagram'] as const).find(p => !used.has(p));
    if (!next) { this.toast.error('All four platforms already added'); return; }
    this.admin.socialLinks.create({ platform: next, ordering: this.social().length + 1 }).subscribe({
      next: () => this.loadSocial(),
      error: () => this.toast.error(),
    });
  }

  removeSocial(row: AdminSocialLink): void {
    this.admin.socialLinks.remove(row.id).subscribe({
      next: () => this.loadSocial(),
      error: () => this.toast.error(),
    });
  }
}
