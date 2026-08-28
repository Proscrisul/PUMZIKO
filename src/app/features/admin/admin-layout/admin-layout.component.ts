import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

import { AuthService } from '../../../core/services/auth.service';
import { WordmarkComponent } from '../../../shared/components/wordmark/wordmark.component';
import { AdminToastComponent } from '../../../shared/admin/toast.component';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: 'layout-dashboard', exact: true },
  { path: '/admin/site', label: 'Site settings', icon: 'settings' },
  { path: '/admin/saturday', label: 'The Saturday', icon: 'calendar' },
  { path: '/admin/questions', label: 'The six answers', icon: 'message-square' },
  { path: '/admin/programmes', label: 'Programmes', icon: 'list' },
  { path: '/admin/people', label: 'People', icon: 'users' },
  { path: '/admin/content', label: 'Page copy & SEO', icon: 'file-text' },
  { path: '/admin/visit', label: 'Visit details', icon: 'map-pin' },
  { path: '/admin/giving', label: 'Giving details', icon: 'hand-coins' },
  { path: '/admin/assets', label: 'Images', icon: 'image' },
  { path: '/admin/enquiries', label: 'Enquiries', icon: 'inbox' },
  { path: '/admin/interest', label: 'Programme interest', icon: 'inbox' },
];

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon,
    WordmarkComponent, AdminToastComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: grid; grid-template-columns: 248px 1fr; min-height: 100vh; }

    aside {
      background: var(--ink); color: var(--bone);
      display: flex; flex-direction: column; padding: 20px 14px;
    }
    .brand { padding: 4px 8px 20px; }
    nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    nav a {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 3px;
      color: var(--bone-70); text-decoration: none;
      font-size: 0.9rem; font-weight: 500;
    }
    nav a:hover { background: rgba(244,240,232,0.08); color: var(--bone); }
    nav a.on { background: var(--ember); color: var(--bone); }
    .foot { border-top: 1px solid rgba(244,240,232,0.14); padding-top: 14px; }
    .who { font-size: 0.8rem; color: var(--bone-70); padding: 0 8px 8px; overflow: hidden; text-overflow: ellipsis; }
    .logout {
      display: flex; align-items: center; gap: 8px; width: 100%;
      background: none; border: 1px solid rgba(244,240,232,0.2); color: var(--bone-70);
      padding: 9px 10px; border-radius: 3px; cursor: pointer; font: inherit;
    }
    .logout:hover { border-color: var(--bone); color: var(--bone); }

    main { padding: 32px 40px; max-width: 900px; }

    @media (max-width: 820px) {
      :host { grid-template-columns: 1fr; }
      aside { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 16px; }
      .brand { padding: 0 8px 0 0; }
      nav { flex-direction: row; flex-wrap: wrap; }
      nav a span { display: none; }
      .foot { border: 0; padding: 0; }
      .who { display: none; }
      main { padding: 20px 16px; }
    }
  `],
  template: `
    <aside>
      <div class="brand"><app-wordmark [size]="34" ground="ink" /></div>
      <nav>
        @for (item of nav; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="on"
            [routerLinkActiveOptions]="{ exact: !!item.exact }"
          >
            <svg [lucideIcon]="item.icon" [size]="17"></svg>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
      <div class="foot">
        <p class="who">{{ auth.user()?.email }}</p>
        <button class="logout" (click)="logout()">
          <svg lucideIcon="log-out" [size]="16"></svg> Sign out
        </button>
      </div>
    </aside>

    <main>
      <router-outlet />
    </main>

    <app-admin-toast />
  `,
})
export class AdminLayoutComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);
  readonly nav = NAV;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
