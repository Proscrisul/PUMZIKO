import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideDynamicIcon } from '@lucide/angular';
import { catchError, of } from 'rxjs';

import { SaturdayService } from '../../../core/services/saturday.service';
import { ExpectationsService } from '../../../core/services/expectations.service';
import { SiteService } from '../../../core/services/site.service';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { connectPageMeta } from '../page-seo';

@Component({
  selector: 'app-what-to-expect',
  imports: [LucideDynamicIcon, RestBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .head { padding: 56px 24px 8px; text-align: center; }
    .head h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
    .head app-rest-bar { max-width: 300px; margin: 22px auto 0; }

    /* Asking questions — its own prominence, above the fold. */
    .asking {
      max-width: 60ch; margin: 32px auto 0; padding: 24px;
      border: 1px solid var(--ember); border-radius: 2px;
    }
    .asking h2 { color: var(--ember); font-size: 1.6rem; margin-bottom: 10px; }
    .asking p { color: var(--ink-70); }

    .rhythm { margin-top: 8px; }
    .step {
      display: grid; grid-template-columns: 96px 1fr; gap: 16px;
      padding: 18px 0; border-bottom: 1px solid var(--hairline);
    }
    .step:last-child { border-bottom: 0; }
    .step .time { color: var(--ink-55); font-variant-numeric: tabular-nums; }
    .step .label { font-family: var(--font-display); font-size: 1.35rem; }
    .step.headline .label { color: var(--ember); }
    .step .desc { color: var(--ink-70); margin-top: 4px; max-width: 56ch; }

    .q { padding: 26px 0; border-bottom: 1px solid var(--hairline); }
    .q:last-child { border-bottom: 0; }
    .q h3 { font-size: 1.5rem; margin-bottom: 10px; }
    .q p { max-width: 62ch; color: var(--ink); }

    .end {
      background: var(--ink); color: var(--bone);
      text-align: center; padding: 64px 24px;
    }
    .end h2 { font-size: clamp(1.6rem, 4vw, 2.4rem); margin-bottom: 20px; }
  `],
  template: `
    <header class="head">
      <h1>What happens on a Saturday</h1>
      <app-rest-bar />

      <div class="asking">
        <h2>You can ask anything, out loud</h2>
        <p>
          Asking questions is a scheduled part of the gathering, with nothing off
          limits. You ask them — we do not ask you. Nobody is put on the spot.
        </p>
      </div>
    </header>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow">In order</p>
        <div class="rhythm">
          @for (part of parts(); track part.ordering) {
            <div class="step" [class.headline]="part.is_headline">
              <div class="time">{{ part.time_label || '—' }}</div>
              <div>
                <div class="label">{{ part.label }}</div>
                @if (part.description) { <p class="desc">{{ part.description }}</p> }
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="section" style="border-top:1px solid var(--hairline)">
      <div class="wrap">
        <p class="eyebrow">The things people actually worry about</p>
        <div style="margin-top:14px">
          @for (q of questions(); track q.id) {
            <div class="q">
              <h3>{{ q.question_text }}</h3>
              <p>{{ q.answer_text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="end">
      <h2>Ask us anything before you come</h2>
      @if (whatsappHref(); as url) {
        <a [href]="url" target="_blank" rel="noopener" class="btn">
          <svg lucideIcon="message-circle" [size]="18"></svg>
          Message us on WhatsApp
        </a>
      }
    </section>
  `,
})
export class WhatToExpectComponent {
  private saturdayService = inject(SaturdayService);
  private expectationsService = inject(ExpectationsService);
  private siteService = inject(SiteService);

  readonly meta = connectPageMeta('what-to-expect', {
    title: 'What happens on a Saturday',
    description:
      'The shape of a Saturday in order, and straight answers to what people ' +
      'are actually afraid to ask. Asking questions is part of the day.',
    path: '/what-to-expect',
  });

  readonly parts = toSignal(
    this.saturdayService.parts().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  readonly questions = toSignal(
    this.expectationsService.questions().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  private readonly site = toSignal(
    this.siteService.settings().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly whatsappHref = () => {
    const digits = (this.site()?.whatsapp_number ?? '').replace(/[^\d]/g, '');
    return digits
      ? `https://wa.me/${digits}?text=${encodeURIComponent('Hi Pumziko — a question before I come: ')}`
      : null;
  };
}
