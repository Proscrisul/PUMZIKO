import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { longDate } from '../../../core/utils/format';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 28px; }
    .stat { border: 1px solid var(--hairline); border-radius: 3px; padding: 18px; background: #fff; }
    .stat .n { font-family: var(--font-display); font-size: 2.2rem; }
    .stat .l { color: var(--ink-55); font-size: 0.85rem; }
    .stat a { color: var(--ember); font-weight: 600; text-decoration: none; font-size: 0.85rem; }
    .links { display: flex; flex-wrap: wrap; gap: 10px; }
  `],
  template: `
    <h1 class="admin-h1">Dashboard</h1>
    <p class="admin-sub">Everything the site shows is editable from here.</p>

    @if (stats(); as s) {
      <div class="grid">
        <div class="stat">
          <div class="n">{{ s.enquiries_unhandled }}</div>
          <div class="l">Enquiries to answer</div>
          <a routerLink="/admin/enquiries">Open inbox →</a>
        </div>
        <div class="stat">
          <div class="n">{{ s.interest_unnotified }}</div>
          <div class="l">Interest sign-ups waiting</div>
          <a routerLink="/admin/interest">Open list →</a>
        </div>
        <div class="stat">
          <div class="n">{{ s.programmes }}</div>
          <div class="l">Programmes</div>
        </div>
        <div class="stat">
          <div class="n">{{ s.people }}</div>
          <div class="l">People</div>
        </div>
        <div class="stat">
          <div class="n">{{ s.launch_mode === 'PreLaunch' ? 'Before' : 'Live' }}</div>
          <div class="l">Launch: {{ s.launch_date ? date(s.launch_date) : 'not set' }}</div>
          <a routerLink="/admin/site">Change →</a>
        </div>
      </div>
    }

    <h2 class="admin-label">Jump to</h2>
    <div class="links">
      <a routerLink="/admin/site" class="btn-ghost btn-sm">Site settings</a>
      <a routerLink="/admin/saturday" class="btn-ghost btn-sm">The Saturday</a>
      <a routerLink="/admin/content" class="btn-ghost btn-sm">Page copy & SEO</a>
      <a routerLink="/admin/visit" class="btn-ghost btn-sm">Visit details</a>
    </div>
  `,
})
export class DashboardComponent {
  private admin = inject(AdminApiService);
  date = longDate;

  readonly stats = toSignal(
    this.admin.dashboard().pipe(catchError(() => of(null))),
    { initialValue: null },
  );
}
