import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The Pumziko app icon: the rest-bar shelter on an ink rounded square
 * (public/pumziko-icon.svg). It is the mark that has to survive a home-screen
 * tile or a favicon — one shape, its own dark ground, corners already rounded.
 *
 * Use it where the wordmark alone is too wide or needs a companion glyph:
 * the nav brand lock-up, the footer, the admin rail, the login screen.
 */
@Component({
  selector: 'app-brand-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  styles: [`
    :host { display: inline-block; flex-shrink: 0; line-height: 0; }
    img { display: block; width: 100%; height: 100%; }
  `],
  template: `<img src="pumziko-icon.svg" width="512" height="512" alt="" aria-hidden="true" />`,
})
export class BrandIconComponent {
  /** Rendered edge length in px. */
  readonly size = input<number>(32);
}
