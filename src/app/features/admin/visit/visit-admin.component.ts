import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { SaveBarComponent } from '../../../shared/admin/save-bar.component';
import { ImagePickerComponent } from '../../../shared/admin/image-picker.component';

@Component({
  selector: 'app-admin-visit',
  imports: [ReactiveFormsModule, SaveBarComponent, ImagePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="admin-h1">Visit details</h1>
    <p class="admin-sub">
      The address stays hidden from the site until "venue confirmed" is ticked.
    </p>

    <form class="admin-form" [formGroup]="form">
      <label class="admin-check">
        <input type="checkbox" formControlName="venue_confirmed" />
        Venue confirmed — publish the address
      </label>
      <label class="admin-check">
        <input type="checkbox" formControlName="venue_is_signed" /> Venue is signed from the street
      </label>

      <label><span class="admin-label">Neighbourhood</span>
        <input class="input" formControlName="neighbourhood" /></label>
      <label><span class="admin-label">Pending message (shown while unconfirmed)</span>
        <textarea class="textarea" formControlName="venue_pending_message"></textarea></label>
      <label><span class="admin-label">First sixty seconds</span>
        <textarea class="textarea" formControlName="first_sixty_seconds"></textarea></label>
      <label><span class="admin-label">"Not signed" note</span>
        <input class="input" formControlName="venue_not_signed_note" /></label>

      <hr class="hairline" />
      <p class="admin-help">Published only when the venue is confirmed:</p>

      <label><span class="admin-label">Address</span>
        <textarea class="textarea" formControlName="address"></textarea></label>
      <div class="row2">
        <label><span class="admin-label">Building</span><input class="input" formControlName="building_name" /></label>
        <label><span class="admin-label">Floor</span><input class="input" formControlName="floor" /></label>
      </div>
      <div class="row2">
        <label><span class="admin-label">Matatu route</span><input class="input" formControlName="matatu_route" /></label>
        <label><span class="admin-label">Matatu stop</span><input class="input" formControlName="matatu_stop" /></label>
      </div>
      <label><span class="admin-label">Parking notes</span>
        <input class="input" formControlName="parking_notes" /></label>
      <label><span class="admin-label">Map embed URL</span>
        <input class="input" formControlName="map_embed_url" placeholder="https://www.google.com/maps/embed?…" /></label>
      <div class="row2">
        <label><span class="admin-label">Latitude</span><input class="input" formControlName="map_lat" /></label>
        <label><span class="admin-label">Longitude</span><input class="input" formControlName="map_lng" /></label>
      </div>

      <div>
        <span class="admin-label">Entrance photo (from the street)</span>
        <app-image-picker [current]="photo()" (picked)="pickPhoto($event)" />
      </div>

      <app-save-bar [dirty]="form.dirty || photoChanged()" [saving]="saving()" (save)="save()" (discard)="load()" />
    </form>
  `,
})
export class VisitAdminComponent {
  private admin = inject(AdminApiService);
  private fb = inject(FormBuilder);
  private toast = inject(AdminToastService);

  readonly saving = signal(false);
  readonly photo = signal<string | null>(null);
  readonly photoChanged = signal(false);
  private newPhoto: File | null | undefined;

  form = this.fb.group({
    venue_confirmed: [false], venue_is_signed: [false],
    neighbourhood: [''], venue_pending_message: [''], first_sixty_seconds: [''],
    venue_not_signed_note: [''],
    address: [''], building_name: [''], floor: [''],
    matatu_route: [''], matatu_stop: [''], parking_notes: [''],
    map_embed_url: [''], map_lat: <string | null>null, map_lng: <string | null>null,
  });

  constructor() { this.load(); }

  load(): void {
    this.admin.getVisitInfo().subscribe(v => {
      this.form.reset(v);
      this.photo.set(v.entrance_photo);
      this.photoChanged.set(false);
      this.newPhoto = undefined;
    });
  }

  pickPhoto(file: File | null): void {
    this.newPhoto = file;
    this.photoChanged.set(true);
  }

  save(): void {
    this.saving.set(true);
    const fd = new FormData();
    for (const [k, v] of Object.entries(this.form.getRawValue())) {
      fd.append(k, v === null || v === undefined ? '' : String(v));
    }
    if (this.newPhoto !== undefined) fd.append('entrance_photo', this.newPhoto ?? '');
    this.admin.patchVisitInfo(fd).subscribe({
      next: () => { this.saving.set(false); this.toast.ok(); this.load(); },
      error: () => { this.saving.set(false); this.toast.error(); },
    });
  }
}
