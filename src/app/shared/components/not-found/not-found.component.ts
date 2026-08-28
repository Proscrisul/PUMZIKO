import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .wrap { padding-block: clamp(80px, 16vw, 160px); text-align: center; }
    h1 { font-size: clamp(2.4rem, 8vw, 4.5rem); margin-bottom: 12px; }
    p { color: var(--ink-70); margin-bottom: 28px; }
  `],
  template: `
    <div class="wrap">
      <h1>Nothing here</h1>
      <p>That page has moved or never existed.</p>
      <a routerLink="/" class="btn">Back to the start</a>
    </div>
  `,
})
export class NotFoundComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({ title: 'Not found', description: 'That page has moved or never existed.' });
  }
}
