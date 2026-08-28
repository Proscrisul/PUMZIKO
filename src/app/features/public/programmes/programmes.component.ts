import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideDynamicIcon } from '@lucide/angular';
import { catchError, of } from 'rxjs';

import { ProgrammesService } from '../../../core/services/programmes.service';
import { ContactMethod, Programme } from '../../../core/models/programme.model';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { connectPageMeta } from '../page-seo';

@Component({
  selector: 'app-programmes',
  imports: [FormsModule, LucideDynamicIcon, RestBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .head { padding: 56px 24px 8px; text-align: center; }
    .head h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
    .head p { color: var(--ink-70); max-width: 52ch; margin: 14px auto 0; }
    .head app-rest-bar { max-width: 300px; margin: 22px auto 0; }

    .item { padding: 28px 0; border-bottom: 1px solid var(--hairline); }
    .item:last-child { border-bottom: 0; }
    .item h2 { font-size: 1.7rem; }
    .item .blurb { color: var(--ink-70); margin-top: 8px; max-width: 60ch; }
    .item .note { color: var(--ink-55); font-size: 0.95rem; margin-top: 8px; }
    .row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; align-items: center; }

    form {
      margin-top: 16px; padding: 20px; border: 1px solid var(--hairline);
      border-radius: 2px; max-width: 440px;
    }
    .two { display: grid; grid-template-columns: 140px 1fr; gap: 12px; }
    .done { display: inline-flex; align-items: center; gap: 8px; color: var(--ember); font-weight: 600; margin-top: 14px; }
    .err { color: var(--ember); font-size: 0.9rem; margin-top: 8px; }
  `],
  template: `
    <header class="head">
      <h1>What we are starting</h1>
      <p>None of these runs yet. Tell us which one you are waiting for.</p>
      <app-rest-bar />
    </header>

    <section class="section">
      <div class="wrap">
        @for (p of programmes(); track p.id) {
          <article class="item">
            <h2>{{ p.name }}</h2>
            @if (p.blurb) { <p class="blurb">{{ p.blurb }}</p> }
            @if (p.starts_note) { <p class="note">{{ p.starts_note }}</p> }

            <div class="row">
              @if (p.external_url) {
                <a [href]="p.external_url" target="_blank" rel="noopener" class="btn-ghost">
                  Visit the site
                  <svg lucideIcon="arrow-up-right" [size]="16"></svg>
                </a>
              }

              @if (doneIds().has(p.id)) {
                <span class="done">
                  <svg lucideIcon="circle-check" [size]="18"></svg>
                  We will let you know
                </span>
              } @else {
                <button class="btn" (click)="toggle(p)">Tell me when this starts</button>
              }
            </div>

            @if (openId() === p.id && !doneIds().has(p.id)) {
              <form (ngSubmit)="submit(p)">
                <label class="field">
                  <span>Your name (optional)</span>
                  <input class="input" name="name" [(ngModel)]="draft.name" />
                </label>
                <div class="two">
                  <label class="field">
                    <span>Reach me by</span>
                    <select class="select" name="method" [(ngModel)]="draft.method">
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                    </select>
                  </label>
                  <label class="field">
                    <span>{{ draft.method === 'Email' ? 'Email address' : 'WhatsApp number' }}</span>
                    <input class="input" name="value" required [(ngModel)]="draft.value" />
                  </label>
                </div>
                <button class="btn" type="submit" [disabled]="submittingId() === p.id || !draft.value.trim()">
                  {{ submittingId() === p.id ? 'Sending…' : 'Add me to the list' }}
                </button>
                @if (errorId() === p.id) {
                  <p class="err">That didn’t send. Try again, or message us on WhatsApp.</p>
                }
              </form>
            }
          </article>
        }
      </div>
    </section>
  `,
})
export class ProgrammesComponent {
  private programmesService = inject(ProgrammesService);

  readonly meta = connectPageMeta('programmes', {
    title: 'What we are starting',
    description:
      'The programmes Pumziko is starting — Sabbath Sofa, feeding, The Mended, ' +
      'Divorce Care, youth mentorship. None runs yet; ask to be told when one begins.',
    path: '/programmes',
  });

  readonly programmes = toSignal(
    this.programmesService.list().pipe(catchError(() => of([] as Programme[]))),
    { initialValue: [] as Programme[] },
  );

  readonly openId = signal<string | null>(null);
  readonly submittingId = signal<string | null>(null);
  readonly errorId = signal<string | null>(null);
  readonly doneIds = signal<Set<string>>(new Set());

  draft: { name: string; method: ContactMethod; value: string } = {
    name: '',
    method: 'WhatsApp',
    value: '',
  };

  toggle(p: Programme): void {
    this.errorId.set(null);
    this.openId.set(this.openId() === p.id ? null : p.id);
  }

  submit(p: Programme): void {
    if (!this.draft.value.trim()) return;
    this.submittingId.set(p.id);
    this.errorId.set(null);
    this.programmesService
      .registerInterest(p.id, {
        name: this.draft.name.trim() || undefined,
        contact_method: this.draft.method,
        contact_value: this.draft.value.trim(),
      })
      .subscribe({
        next: () => {
          this.submittingId.set(null);
          this.doneIds.update(s => new Set(s).add(p.id));
          this.openId.set(null);
          this.draft = { name: '', method: 'WhatsApp', value: '' };
        },
        error: () => {
          this.submittingId.set(null);
          this.errorId.set(p.id);
        },
      });
  }
}
