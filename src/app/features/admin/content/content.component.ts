import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminPageMeta, AdminSnippet } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { ImagePickerComponent } from '../../../shared/admin/image-picker.component';

@Component({
  selector: 'app-admin-content',
  imports: [ImagePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .card { border: 1px solid var(--hairline); border-radius: 3px; padding: 16px; background: #fff; margin-bottom: 12px; }
    .key { font-family: ui-monospace, monospace; font-size: 0.8rem; color: var(--ink-55); margin-bottom: 8px; }
    textarea { min-height: 90px; }
    .og-grid { display: grid; gap: 10px; }
  `],
  template: `
    <h1 class="admin-h1">Page copy & SEO</h1>
    <p class="admin-sub">The editable text fragments in each page, and the link-preview text pasted links show.</p>

    <h2 class="admin-h1" style="font-size:1.3rem;margin-top:8px">Copy fragments</h2>
    @for (s of snippets(); track s.id) {
      <div class="card">
        <div class="key">{{ s.key }}</div>
        <input class="input" style="margin-bottom:8px" [value]="s.heading" placeholder="Heading (optional)"
               (change)="saveSnippet(s, {heading: $any($event.target).value})" />
        <textarea class="textarea" [value]="s.body" placeholder="Body — blank lines make paragraphs"
                  (change)="saveSnippet(s, {body: $any($event.target).value})"></textarea>
      </div>
    }

    <h2 class="admin-h1" style="font-size:1.3rem;margin-top:28px">Link previews (Open Graph)</h2>
    @for (m of meta(); track m.id) {
      <div class="card og-grid">
        <div class="key">/{{ m.slug }}</div>
        <input class="input" [value]="m.og_title" placeholder="Title"
               (change)="saveMeta(m, {og_title: $any($event.target).value})" />
        <textarea class="textarea" style="min-height:60px" [value]="m.og_description" placeholder="Description (≤ 300 chars)"
                  (change)="saveMeta(m, {og_description: $any($event.target).value})"></textarea>
        <div>
          <span class="admin-label">Image</span>
          <app-image-picker [current]="m.og_image" (picked)="setImage(m, $event)" />
        </div>
      </div>
    }
  `,
})
export class ContentComponent {
  private admin = inject(AdminApiService);
  private toast = inject(AdminToastService);

  readonly snippets = signal<AdminSnippet[]>([]);
  readonly meta = signal<AdminPageMeta[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.admin.listSnippets().subscribe(list =>
      this.snippets.set([...list].sort((a, b) => a.key.localeCompare(b.key))),
    );
    this.admin.listPageMeta().subscribe(list =>
      this.meta.set([...list].sort((a, b) => a.slug.localeCompare(b.slug))),
    );
  }

  saveSnippet(row: AdminSnippet, body: Partial<AdminSnippet>): void {
    this.admin.updateSnippet(row.id, body).subscribe({
      next: () => { this.toast.ok(); this.load(); }, error: () => this.toast.error(),
    });
  }

  saveMeta(row: AdminPageMeta, body: Partial<AdminPageMeta>): void {
    this.admin.updatePageMeta(row.id, body).subscribe({
      next: () => { this.toast.ok(); this.load(); }, error: () => this.toast.error(),
    });
  }

  setImage(row: AdminPageMeta, file: File | null): void {
    const fd = new FormData();
    fd.append('og_image', file ?? '');
    this.admin.updatePageMeta(row.id, fd).subscribe({
      next: () => { this.toast.ok('Image saved'); this.load(); }, error: () => this.toast.error(),
    });
  }
}
