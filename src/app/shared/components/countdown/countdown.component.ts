import {
  ChangeDetectionStrategy, Component, OnDestroy, PLATFORM_ID,
  computed, inject, input, signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Countdown to the first gathering — Saturday 3 October 2026, 10:00 EAT.
 * One row of number/label pairs. Ticks only in the browser (SSR renders the
 * first frame, then it comes alive). Once the date has passed it swaps to a
 * short "we are gathering now" line so it never shows negative time.
 */
@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.on-ink]': "ground() === 'ink'",
    role: 'timer',
    'aria-label': 'Time until the first gathering',
    // Live widget: its DOM diverges from the SSR frame within a second, so let
    // the client re-render it rather than reconcile (avoids a hydration mismatch).
    ngSkipHydration: 'true',
  },
  styles: [`
    :host { display: block; }
    .cd {
      display: flex; gap: 8px;
      /* Four units, one row, shrink-to-fit — never wider than the viewport. */
      max-width: 340px;
      margin-inline: var(--cd-mx, 0);
    }
    .unit {
      flex: 1 1 0; min-width: 0;
      display: flex; flex-direction: column; align-items: center;
      padding: 12px 6px;
      border: 1px solid var(--hairline); border-radius: 2px;
    }
    .n {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 7vw, 2.6rem); line-height: 1;
      font-variant-numeric: tabular-nums; letter-spacing: 0.02em;
    }
    .l {
      margin-top: 6px;
      font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--ink-55);
    }
    .live {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 5vw, 2rem); color: var(--ember);
    }

    :host(.on-ink) .unit { border-color: rgba(244, 240, 232, 0.22); }
    :host(.on-ink) .l { color: var(--bone-70); }
  `],
  template: `
    @if (remaining() === null) {
      <p class="live">We are gathering now — come in.</p>
    } @else {
      <div class="cd">
        @for (u of units(); track u.label) {
          <div class="unit">
            <span class="n">{{ u.value }}</span>
            <span class="l">{{ u.label }}</span>
          </div>
        }
      </div>
    }
  `,
})
export class CountdownComponent implements OnDestroy {
  /** ISO target instant. Defaults to the launch: 3 Oct 2026, 10:00 EAT. */
  readonly target = input<string>('2026-10-03T10:00:00+03:00');
  /** Ground the countdown sits on — sets label/border colours. */
  readonly ground = input<'bone' | 'ink'>('bone');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly now = signal(Date.now());
  private timer?: ReturnType<typeof setInterval>;

  /** Milliseconds left, or null once the target has passed. */
  readonly remaining = computed(() => {
    const ms = new Date(this.target()).getTime() - this.now();
    return ms > 0 ? ms : null;
  });

  readonly units = computed(() => {
    const ms = this.remaining() ?? 0;
    const s = Math.floor(ms / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return [
      { label: 'Days', value: String(Math.floor(s / 86_400)) },
      { label: 'Hrs', value: pad(Math.floor((s % 86_400) / 3_600)) },
      { label: 'Min', value: pad(Math.floor((s % 3_600) / 60)) },
      { label: 'Sec', value: pad(s % 60) },
    ];
  });

  constructor() {
    if (this.isBrowser) {
      this.timer = setInterval(() => this.now.set(Date.now()), 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
