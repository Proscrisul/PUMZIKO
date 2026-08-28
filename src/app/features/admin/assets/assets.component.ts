import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminMediaAsset } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { ConfirmButtonComponent } from '../../../shared/admin/confirm-button.component';

@Component({
  selector: 'app-admin-assets',
  imports: [LucideDynamicIcon, ConfirmButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .add { border: 1px dashed var(--hairline); border-radius: 3px; padding: 16px; background: #fff; margin-bottom: 18px; display: grid; gap: 10px; max-width: 460px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
    .tile { border: 1px solid var(--hairline); border-radius: 3px; background: #fff; overflow: hidden; }
    .tile img { width: 100%; height: 130px; object-fit: cover; display: block; background: var(--bone); }
    .tile .body { padding: 10px; }
    .tile input { font-size: 0.85rem; }
    .tile .row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  `],
  template: `
    <h1 class="admin-h1">Images</h1>
    <p class="admin-sub">Reusable photos and graphics. The entrance photo lives on the Visit page.</p>

    <div class="add">
      <input class="input" placeholder="Name" #name />
      <select class="select" #kind>
        <option value="Photo">Photograph</option>
        <option value="Social">Social graphic</option>
        <option value="Other">Other</option>
      </select>
      <input class="input" placeholder="Alt text" #alt />
      <input type="file" accept="image/*,application/pdf" #file />
      <button class="btn btn-sm" (click)="create(name, kind, alt, file)">
        <svg lucideIcon="plus" [size]="15"></svg> Upload
      </button>
    </div>

    <div class="grid">
      @for (a of items(); track a.id) {
        <div class="tile">
          <img [src]="a.file" [alt]="a.alt" />
          <div class="body">
            <input class="input" [value]="a.name" (change)="patch(a, {name: $any($event.target).value})" />
            <input class="input" style="margin-top:6px" [value]="a.alt" placeholder="Alt"
                   (change)="patch(a, {alt: $any($event.target).value})" />
            <div class="row">
              <span class="admin-pill">{{ a.kind }}</span>
              <app-confirm-button (confirmed)="remove(a)" />
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AssetsComponent {
  private admin = inject(AdminApiService);
  private toast = inject(AdminToastService);
  readonly items = signal<AdminMediaAsset[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.admin.mediaAssets.list().subscribe(list => this.items.set(list));
  }

  create(name: HTMLInputElement, kind: HTMLSelectElement, alt: HTMLInputElement, file: HTMLInputElement): void {
    const f = file.files?.[0];
    if (!f || !name.value.trim()) { this.toast.error('Name and file required'); return; }
    const fd = new FormData();
    fd.append('name', name.value.trim());
    fd.append('kind', kind.value);
    fd.append('alt', alt.value);
    fd.append('file', f);
    this.admin.mediaAssets.create(fd).subscribe({
      next: () => { name.value = ''; alt.value = ''; file.value = ''; this.load(); this.toast.ok('Uploaded'); },
      error: () => this.toast.error(),
    });
  }

  patch(row: AdminMediaAsset, body: Partial<AdminMediaAsset>): void {
    this.admin.mediaAssets.update(row.id, body).subscribe({
      next: () => this.toast.ok(), error: () => this.toast.error(),
    });
  }

  remove(row: AdminMediaAsset): void {
    this.admin.mediaAssets.remove(row.id).subscribe({ next: () => this.load(), error: () => this.toast.error() });
  }
}
