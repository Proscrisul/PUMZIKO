import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { catchError, of } from 'rxjs';

import { SiteService } from '../../../core/services/site.service';
import { WordmarkComponent } from '../../../shared/components/wordmark/wordmark.component';
import { BrandIconComponent } from '../../../shared/components/brand-icon/brand-icon.component';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { WhatsappButtonComponent } from '../../../shared/components/whatsapp-button/whatsapp-button.component';
import { gatheringLine } from '../../../core/utils/format';

// The site's pages. Fixed — not fetched.
const NAV_LINKS = [
  { path: '/home', label: 'Home' },
  { path: '/what-to-expect', label: 'What to expect' },
  { path: '/programmes', label: 'Programmes' },
  { path: '/visit', label: 'Visit' },
  { path: '/give', label: 'Give' },
  { path: '/contact', label: 'Contact' },
];

@Component({
  selector: 'app-public-layout',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon,
    WordmarkComponent, BrandIconComponent, RestBarComponent, WhatsappButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; min-height: 100vh; display: flex; flex-direction: column; }

    /* ── Nav ── */
    header {
      position: sticky; top: 0; z-index: 50;
      background: color-mix(in srgb, var(--bone) 92%, transparent);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--hairline);
    }
    .nav {
      max-width: var(--page-max); margin-inline: auto;
      padding: 12px 24px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
    .links { display: flex; align-items: center; gap: 4px; }
    .links a {
      padding: 8px 12px; border-radius: 2px;
      font-size: 0.9375rem; font-weight: 600;
      color: var(--ink-70); text-decoration: none;
      transition: color 0.12s, background 0.12s;
    }
    .links a:hover { color: var(--ink); }
    .links a.active { color: var(--ember); }
    .hamburger {
      display: none; background: none; border: 1px solid var(--hairline);
      border-radius: 2px; padding: 8px; cursor: pointer; color: var(--ink);
    }
    .mobile { display: none; }

    @media (max-width: 720px) {
      .links { display: none; }
      .hamburger { display: inline-flex; }
      .mobile {
        display: flex; flex-direction: column; gap: 2px;
        padding: 8px 24px 16px; border-top: 1px solid var(--hairline);
      }
      .mobile a {
        padding: 12px 8px; font-size: 1rem; font-weight: 600;
        color: var(--ink-70); text-decoration: none;
      }
      .mobile a.active { color: var(--ember); }
    }

    main { flex: 1; }

    /* ── Broadcasting partner ── */
    .partner {
      border-top: 1px solid var(--hairline);
      background: #fff;
      padding: 30px 24px;
      text-align: center;
    }
    .partner .label {
      font-family: var(--font-body);
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--ink-55); margin-bottom: 14px;
    }
    .partner img { height: 52px; width: auto; max-width: 80%; display: inline-block; }
    @media (max-width: 480px) { .partner img { height: 40px; } }

    /* ── Footer ── */
    footer { background: var(--ink); color: var(--bone); margin-top: auto; }
    .foot {
      max-width: var(--page-max); margin-inline: auto; padding: 64px 24px 40px;
    }
    .foot app-rest-bar { margin-bottom: 40px; }
    .foot-brand { display: inline-flex; align-items: center; gap: 12px; }
    .foot-grid {
      display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 40px;
    }
    .foot h4 {
      font-family: var(--font-body); font-size: 0.75rem; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--bone-70); margin-bottom: 14px;
    }
    .foot a { color: var(--bone-70); text-decoration: none; font-size: 0.9375rem; }
    .foot a:hover { color: var(--bone); }
    .foot ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .foot .muted { color: var(--bone-70); font-size: 0.9375rem; line-height: 1.7; }
    .foot-bottom {
      margin-top: 44px; padding-top: 20px; border-top: 1px solid rgba(244,240,232,0.16);
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;
      color: var(--bone-70); font-size: 0.8125rem;
    }
    @media (max-width: 720px) { .foot-grid { grid-template-columns: 1fr; gap: 32px; } }
  `],
  template: `
    <header>
      <div class="nav">
        <a routerLink="/" class="brand" aria-label="Pumziko home">
          <app-brand-icon [size]="30" />
          <app-wordmark [size]="30" />
        </a>

        <nav class="links">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active">{{ link.label }}</a>
          }
        </nav>

        <button
          class="hamburger"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Menu"
        >
          <svg [lucideIcon]="menuOpen() ? 'x' : 'menu'" [size]="20"></svg>
        </button>
      </div>

      @if (menuOpen()) {
        <nav class="mobile">
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              (click)="menuOpen.set(false)"
            >{{ link.label }}</a>
          }
        </nav>
      }
    </header>

    <main>
      <router-outlet />
    </main>

    <section class="partner">
      <p class="label">Broadcasting partner</p>
      <img src="BetterLifebanner.png" alt="Better Life TV" width="1290" height="244" />
    </section>

    <footer>
      <div class="foot">
        <app-rest-bar ground="ink" />

        <div class="foot-grid">
          <div>
            <span class="foot-brand">
              <app-brand-icon [size]="40" />
              <app-wordmark [size]="44" ground="ink" />
            </span>
            <p class="muted" style="margin-top:16px;max-width:34ch">
              {{ site()?.tagline || 'Sinners Only' }}. A church in
              {{ site()?.neighbourhood_label || 'Nairobi' }}.
            </p>
            <p class="muted" style="margin-top:12px">
              {{ gathering() }}
            </p>
          </div>

          <div>
            <h4>Pages</h4>
            <ul>
              @for (link of navLinks; track link.path) {
                <li><a [routerLink]="link.path">{{ link.label }}</a></li>
              }
            </ul>
          </div>

          <div>
            <h4>Reach us</h4>
            <ul>
              @if (site()?.contact_email; as email) {
                <li><a [href]="'mailto:' + email">{{ email }}</a></li>
              }
              @for (s of social(); track s.platform) {
                <li><a [href]="s.url" target="_blank" rel="noopener">{{ s.platform }}</a></li>
              }
            </ul>
          </div>
        </div>

        <div class="foot-bottom">
          <span>© {{ year }} Pumziko</span>
          <a routerLink="/sinners-only">Why "Sinners Only"</a>
        </div>
      </div>
    </footer>

    <app-whatsapp-button [number]="site()?.whatsapp_number || ''" />
  `,
})
export class PublicLayoutComponent {
  private siteService = inject(SiteService);

  readonly navLinks = NAV_LINKS;
  readonly year = new Date().getFullYear();
  readonly menuOpen = signal(false);

  readonly site = toSignal(
    this.siteService.settings().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly social = toSignal(
    this.siteService.socialLinks().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  readonly gathering = () => {
    const s = this.site();
    return s ? gatheringLine(s) : 'Saturdays, 10:00–14:00';
  };
}
