import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Snippet } from '../../../core/models/content.model';

/**
 * Renders one editable copy snippet from the CMS. Body text is plain — blank
 * lines become paragraph breaks. No rich text, by design (brief tone rule:
 * warm, direct, unembarrassed).
 */
@Component({
  selector: 'app-section-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    h2 { font-size: clamp(1.7rem, 4vw, 2.6rem); margin-bottom: 20px; }
    .body { max-width: 62ch; }
    .body p + p { margin-top: 1.1em; }
  `],
  template: `
    @if (snippet().heading) { <h2>{{ snippet().heading }}</h2> }
    <div class="body prose">
      @for (para of paragraphs(); track $index) { <p>{{ para }}</p> }
    </div>
  `,
})
export class SectionBlockComponent {
  readonly snippet = input.required<Snippet>();

  protected readonly paragraphs = computed(() =>
    this.snippet().body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean),
  );
}
