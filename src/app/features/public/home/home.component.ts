import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { catchError, of } from 'rxjs';

import { SiteService } from '../../../core/services/site.service';
import { SaturdayService } from '../../../core/services/saturday.service';
import { ContentService } from '../../../core/services/content.service';
import { WordmarkComponent } from '../../../shared/components/wordmark/wordmark.component';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { SectionBlockComponent } from '../../../shared/components/section-block/section-block.component';
import { CountdownComponent } from '../../../shared/components/countdown/countdown.component';
import { gatheringLine, longDate } from '../../../core/utils/format';
import { connectPageMeta } from '../page-seo';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink, LucideDynamicIcon, WordmarkComponent, RestBarComponent, SectionBlockComponent,
    CountdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    /* Above the fold: name, tagline, when, where, one button. Nothing else. */
    .hero {
      min-height: calc(100svh - 55px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 48px 24px 64px; gap: 22px;
    }
    .hero { max-width: 100%; }
    .hero app-rest-bar { max-width: min(320px, 100%); }
    /* The wordmark is set in px on its host; clamp it here so PUMZIKO never
       overruns a narrow phone (it is white-space:nowrap). */
    .hero app-wordmark { font-size: clamp(2.6rem, 12vw, 6rem) !important; max-width: 100%; }
    .tagline {
      font-family: var(--font-display); font-size: clamp(1.05rem, 4vw, 1.6rem);
      letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-70);
      max-width: 100%; overflow-wrap: break-word;
    }
    .facts { font-size: 1.05rem; color: var(--ink); max-width: 100%; }
    .facts strong { font-weight: 700; }

    /* Hero call-to-action stack: the one button, then the "why" link. */
    .hero-cta { display: flex; flex-direction: column; align-items: center; gap: 14px; }
    .why-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--ember); font-weight: 600; font-size: 1rem;
      text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px;
    }
    .why-link svg { transition: transform 0.15s ease; }
    .why-link:hover svg { transform: translateX(3px); }

    .band { border-top: 1px solid var(--hairline); }

    /* Countdown to launch */
    .countdown-band .wrap { text-align: center; }
    .countdown-band .cd-date {
      font-family: var(--font-display); font-size: clamp(1.3rem, 4vw, 2rem);
      margin: 8px 0 22px;
    }
    .countdown-band app-countdown { --cd-mx: auto; }

    .saturday { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
    .part {
      display: inline-flex; align-items: baseline; gap: 8px;
      padding: 10px 14px; border: 1px solid var(--hairline); border-radius: 2px;
      font-size: 0.98rem;
    }
    .part .t { color: var(--ink-55); font-size: 0.85rem; }
    .part.headline {
      border-color: var(--ember); color: var(--ember); font-weight: 700;
    }
    .headline-note { margin-top: 16px; color: var(--ink-70); max-width: 60ch; }

    .launch {
      display: flex; flex-direction: column; align-items: flex-start; gap: 16px;
      max-width: 100%;
    }
    .launch .when {
      font-family: var(--font-display); font-size: clamp(1.5rem, 5vw, 2.4rem);
      max-width: 100%; overflow-wrap: break-word;
    }

    /* ── Phones: nothing clipped, everything stacks ── */
    @media (max-width: 480px) {
      .hero { padding: 40px 20px 52px; gap: 18px; }
      .hero-cta { width: 100%; }
      .hero-cta .btn { width: 100%; justify-content: center; text-align: center; }
      .why-link { flex-wrap: wrap; justify-content: center; text-align: center; }
      .saturday { gap: 8px; }
      .part { font-size: 0.92rem; padding: 9px 12px; }
      .headline-note { font-size: 0.95rem; }
    }
  `],
  template: `
    <!-- ── Above the fold ── -->
    <section class="hero">
      <app-wordmark [size]="heroSize()" />
      <p class="tagline">{{ site()?.tagline || 'Sinners Only' }}</p>
      <app-rest-bar />
      <p class="facts">
        <strong>{{ gathering() }}</strong><br />
        {{ site()?.neighbourhood_label || 'Kilimani, Nairobi' }}
      </p>
      <div class="hero-cta">
        <a routerLink="/what-to-expect" class="btn">
          What happens on a Saturday
          <svg lucideIcon="arrow-right" [size]="18"></svg>
        </a>
        <a routerLink="/sinners-only" class="why-link">
          Why “Sinners Only”?
          <svg lucideIcon="arrow-right" [size]="15"></svg>
        </a>
      </div>
    </section>

    <!-- ── Counting down to launch ── -->
    <section class="section band countdown-band">
      <div class="wrap">
        <p class="eyebrow">Counting down to the first gathering</p>
        <p class="cd-date">Saturday 3 October 2026 · 10:00</p>
        <app-countdown />
      </div>
    </section>

    <!-- ── Who this is for ── -->
    @if (intro(); as snippet) {
      <section class="section band">
        <div class="wrap">
          <app-section-block [snippet]="snippet" />
        </div>
      </section>
    }

    <!-- ── The shape of a Saturday ── -->
    <section class="section band">
      <div class="wrap">
        <p class="eyebrow">The shape of a Saturday</p>
        <h2 style="font-size:clamp(1.45rem,4vw,2.6rem);margin-top:10px">
          Arriving, singing, praying, learning, asking questions, eating, leaving.
        </h2>
        <div class="saturday">
          @for (part of parts(); track part.ordering) {
            <span class="part" [class.headline]="part.is_headline">
              {{ part.label }}
              @if (part.time_label) { <span class="t">{{ part.time_label }}</span> }
            </span>
          }
        </div>
        <p class="headline-note">
          Asking questions is a scheduled part of the gathering, with nothing off
          limits. You ask them — we do not ask you.
        </p>
      </div>
    </section>

    <!-- ── Launch / This week ── -->
    <section class="section band">
      <div class="wrap launch">
        @if (isPreLaunch()) {
          <p class="eyebrow">First gathering</p>
          <p class="when">{{ launchLine() }}</p>
          <p style="color:var(--ink-70);max-width:52ch">
            Message us before you come — ask anything at all.
          </p>
        } @else if (weekNote(); as note) {
          <p class="eyebrow">{{ note.heading }}</p>
          <div class="prose" style="margin-top:6px">
            @for (para of note.body.split('\n\n'); track $index) { <p>{{ para }}</p> }
          </div>
        }
      </div>
    </section>
  `,
})
export class HomeComponent {
  private siteService = inject(SiteService);
  private saturdayService = inject(SaturdayService);
  private contentService = inject(ContentService);

  readonly site = toSignal(
    this.siteService.settings().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly parts = toSignal(
    this.saturdayService.parts().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  readonly weekNote = toSignal(
    this.saturdayService.thisWeek().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  private readonly snippets = toSignal(
    this.contentService.snippetsFor('home').pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  readonly intro = computed(
    () => this.snippets().find(s => s.key === 'home.who-this-is-for') ?? null,
  );

  readonly heroSize = computed(() => 96);

  readonly gathering = computed(() => {
    const s = this.site();
    return s ? gatheringLine(s) : 'Saturdays, 10:00–14:00';
  });

  readonly isPreLaunch = computed(() => this.site()?.launch_mode !== 'ThisWeek');

  readonly launchLine = computed(() => {
    const d = this.site()?.launch_date ?? null;
    return d ? longDate(d) : 'Saturday 26 September';
  });

  constructor() {
    connectPageMeta('home', {
      title: 'Pumziko',
      description:
        'A church in Nairobi for people who feel excluded from church. ' +
        'Saturdays, 10:00–14:00, Kilimani. Asking questions is part of the day.',
      path: '/',
    });
  }
}
