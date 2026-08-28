import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The rest bar: a rule interrupted by a solid block, borrowed from the musical
 * rest (a notated silence). Pumziko means rest. The block works alone — it is
 * the favicon and the bug in the corner of a video — and it is one shape, so it
 * never breaks.
 */
@Component({
  selector: 'app-rest-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.on-ink]': "ground() === 'ink'",
    'aria-hidden': 'true',
  },
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      width: 100%;
    }
    .rule {
      flex: 1;
      height: 3px;
      background: var(--ember);
      max-width: 240px;
    }
    .block {
      width: 46px;
      height: 20px;
      background: var(--ember);
      flex-shrink: 0;
    }
    :host(.on-ink) .rule,
    :host(.on-ink) .block { background: var(--ember); }
  `],
  template: `
    <span class="rule"></span>
    <span class="block"></span>
    <span class="rule"></span>
  `,
})
export class RestBarComponent {
  readonly ground = input<'bone' | 'ink'>('bone');
}
