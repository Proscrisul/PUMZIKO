import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The Pumziko wordmark: the name in Bebas Neue with a near-invisible ember cross
 * formed by an arm on the stem of the I.
 *
 * Geometry is from the brief (§02), as fractions of the wordmark font size:
 *   - I stem width        0.120em
 *   - crossbar            0.160em wide × 0.050em tall, 0.020em overhang each side
 *   - vertical position   centre of the bar sits 30% of cap height below the
 *                         cap line; cap height ≈ 0.700em
 *   - fill                ember #B8420F, no outline, no rounding
 *
 * The bar is placed relative to the <span> around the I, never by arithmetic
 * from the start of the word (that would land it on the Z the moment tracking
 * changes). Below 40px the arm merges with the stem and the word reads as
 * struck through — the one association this church cannot afford — so it is
 * dropped entirely and the plain Bebas I is used.
 */
@Component({
  selector: 'app-wordmark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.font-size.px]': 'size()',
    '[class.on-ink]': "ground() === 'ink'",
    '[class.no-cross]': '!showCross()',
    'aria-label': 'Pumziko',
    role: 'img',
  },
  styles: [`
    :host {
      display: inline-block;
      font-family: var(--font-display);
      font-size: 40px;
      line-height: 1;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--ink);
      user-select: none;
      white-space: nowrap;
    }
    :host(.on-ink) { color: var(--bone); }

    .i {
      position: relative;
      display: inline-block;
    }

    /* The cross arm. In ember it reads at a glance as a stray tick of the
       accent colour; only on a second look does it resolve. */
    .i::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 0.16em;
      height: 0.05em;
      /* cap line ≈ 0.15em below the top of the line box for Bebas Neue;
         + 0.21em (30% of the 0.70em cap height) − half the bar height. */
      top: 0.335em;
      background: var(--ember);
    }
    :host(.no-cross) .i::after { display: none; }
  `],
  template: `PUMZ<span class="i">I</span>KO`,
})
export class WordmarkComponent {
  /** Rendered font size in px. */
  readonly size = input<number>(40);
  /** Which ground the mark sits on — sets the letter colour. */
  readonly ground = input<'bone' | 'ink'>('bone');

  protected readonly showCross = computed(() => this.size() >= 40);
}
