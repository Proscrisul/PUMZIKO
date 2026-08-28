import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { ContentService } from '../../../core/services/content.service';
import { SectionBlockComponent } from '../../../shared/components/section-block/section-block.component';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { connectPageMeta } from '../page-seo';

@Component({
  selector: 'app-sinners-only',
  imports: [SectionBlockComponent, RestBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .head { padding: 64px 24px 8px; text-align: center; }
    .head h1 { font-size: clamp(2.2rem, 7vw, 4.2rem); }
    .head app-rest-bar { max-width: 300px; margin: 22px auto 0; }
    .body { padding: 8px 24px 24px; }
    .body app-section-block + app-section-block { margin-top: 36px; }
    .empty { color: var(--ink-55); }
  `],
  template: `
    <header class="head">
      <h1>Why "Sinners Only"</h1>
      <app-rest-bar />
    </header>

    <section class="section body">
      <div class="wrap prose">
        @for (snippet of snippets(); track snippet.key) {
          <app-section-block [snippet]="snippet" />
        } @empty {
          <p class="empty">This page is being written.</p>
        }
      </div>
    </section>
  `,
})
export class SinnersOnlyComponent {
  private contentService = inject(ContentService);

  readonly snippets = toSignal(
    this.contentService.snippetsFor('sinners-only').pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  constructor() {
    connectPageMeta('sinners-only', {
      title: 'Why "Sinners Only"',
      description:
        'The name, explained properly and once. Pumziko is a Seventh-day ' +
        'Adventist congregation, planted through CLAIM.',
      path: '/sinners-only',
    });
  }
}
