import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { SaveBarComponent } from '../../../shared/admin/save-bar.component';

@Component({
  selector: 'app-admin-giving',
  imports: [ReactiveFormsModule, SaveBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="admin-h1">Giving details</h1>
    <p class="admin-sub">Display only. No amounts, no campaign framing.</p>

    <form class="admin-form" [formGroup]="form">
      <div class="row2">
        <label><span class="admin-label">M-Pesa paybill</span><input class="input" formControlName="mpesa_paybill" /></label>
        <label><span class="admin-label">M-Pesa account</span><input class="input" formControlName="mpesa_account" /></label>
      </div>
      <label><span class="admin-label">M-Pesa till</span><input class="input" formControlName="mpesa_till" /></label>

      <hr class="hairline" />
      <div class="row2">
        <label><span class="admin-label">Bank name</span><input class="input" formControlName="bank_name" /></label>
        <label><span class="admin-label">Account name</span><input class="input" formControlName="bank_account_name" /></label>
      </div>
      <div class="row2">
        <label><span class="admin-label">Account number</span><input class="input" formControlName="bank_account_number" /></label>
        <label><span class="admin-label">Branch</span><input class="input" formControlName="bank_branch" /></label>
      </div>
      <label><span class="admin-label">SWIFT</span><input class="input" formControlName="bank_swift" /></label>

      <hr class="hairline" />
      <label><span class="admin-label">Card link (for anyone abroad)</span>
        <input class="input" formControlName="card_url" placeholder="https://…" /></label>
      <label><span class="admin-label">Intro note</span>
        <textarea class="textarea" formControlName="intro_note"></textarea></label>
      <label><span class="admin-label">Visitors note (the headline)</span>
        <input class="input" formControlName="visitors_note" /></label>

      <app-save-bar [dirty]="form.dirty" [saving]="saving()" (save)="save()" (discard)="load()" />
    </form>
  `,
})
export class GivingAdminComponent {
  private admin = inject(AdminApiService);
  private fb = inject(FormBuilder);
  private toast = inject(AdminToastService);
  readonly saving = signal(false);

  form = this.fb.group({
    mpesa_paybill: [''], mpesa_account: [''], mpesa_till: [''],
    bank_name: [''], bank_account_name: [''], bank_account_number: [''],
    bank_branch: [''], bank_swift: [''],
    card_url: [''], intro_note: [''], visitors_note: [''],
  });

  constructor() { this.load(); }

  load(): void {
    this.admin.getGivingInfo().subscribe(g => this.form.reset(g));
  }

  save(): void {
    this.saving.set(true);
    this.admin.patchGivingInfo(this.form.getRawValue() as never).subscribe({
      next: () => { this.saving.set(false); this.form.markAsPristine(); this.toast.ok(); },
      error: () => { this.saving.set(false); this.toast.error(); },
    });
  }
}
