import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideDynamicIcon } from '@lucide/angular';
import { catchError, of } from 'rxjs';

import { ContactService } from '../../../core/services/contact.service';
import { PeopleService } from '../../../core/services/people.service';
import { SiteService } from '../../../core/services/site.service';
import { ContactMethod } from '../../../core/models/programme.model';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { connectPageMeta } from '../page-seo';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, LucideDynamicIcon, RestBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .head { padding: 56px 24px 8px; text-align: center; }
    .head h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
    .head app-rest-bar { max-width: 300px; margin: 22px auto 0; }

    .primary {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      margin-top: 28px;
    }
    .primary .btn { font-size: 1.15rem; padding: 18px 30px; }
    .promise { color: var(--ink-55); }
    .email a { color: var(--ember); font-weight: 600; }

    .people { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 12px; }
    .person { display: flex; gap: 14px; align-items: flex-start; }
    .person img { width: 64px; height: 64px; object-fit: cover; border-radius: 2px; flex-shrink: 0; }
    .person .name { font-weight: 700; }
    .person .role { color: var(--ink-55); font-size: 0.9rem; }
    .person .bio { color: var(--ink-70); font-size: 0.92rem; margin-top: 6px; }

    form { max-width: 480px; margin-top: 12px; }
    .two { display: grid; grid-template-columns: 140px 1fr; gap: 12px; }
    .done { color: var(--ember); font-weight: 600; display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; }
    .err { color: var(--ember); font-size: 0.9rem; margin-top: 8px; }
  `],
  template: `
    <header class="head">
      <h1>Contact</h1>
      <app-rest-bar />

      <div class="primary">
        @if (whatsappHref(); as url) {
          <a [href]="url" target="_blank" rel="noopener" class="btn">
            <svg lucideIcon="message-circle" [size]="20"></svg>
            Message us on WhatsApp
          </a>
        }
        <p class="promise">{{ site()?.reply_promise || 'We reply within a day.' }}</p>
        @if (site()?.contact_email; as email) {
          <p class="email">or email <a [href]="'mailto:' + email">{{ email }}</a></p>
        }
      </div>
    </header>

    <section class="section" style="border-top:1px solid var(--hairline)">
      <div class="wrap">
        <p class="eyebrow">Who you are writing to</p>
        <div class="people">
          @for (p of people(); track p.id) {
            <div class="person">
              @if (p.photo) { <img [src]="p.photo" [alt]="p.name" /> }
              <div>
                <div class="name">{{ p.name }}</div>
                <div class="role">{{ p.role_title }}</div>
                @if (p.bio) { <p class="bio">{{ p.bio }}</p> }
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="section" style="border-top:1px solid var(--hairline)">
      <div class="wrap">
        <p class="eyebrow">Or leave a message</p>
        @if (done()) {
          <p class="done">
            <svg lucideIcon="circle-check" [size]="18"></svg>
            Got it. We will reply within a day.
          </p>
        } @else {
          <form (ngSubmit)="submit()">
            <label class="field">
              <span>Your name (optional)</span>
              <input class="input" name="name" [(ngModel)]="draft.name" />
            </label>
            <div class="two">
              <label class="field">
                <span>Reply by</span>
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
            <label class="field">
              <span>Message</span>
              <textarea class="textarea" name="message" [(ngModel)]="draft.message"></textarea>
            </label>
            <button class="btn" type="submit" [disabled]="submitting() || !draft.value.trim()">
              {{ submitting() ? 'Sending…' : 'Send' }}
            </button>
            @if (error()) { <p class="err">That didn’t send. Try WhatsApp instead.</p> }
          </form>
        }
      </div>
    </section>
  `,
})
export class ContactComponent {
  private contactService = inject(ContactService);
  private peopleService = inject(PeopleService);
  private siteService = inject(SiteService);

  readonly meta = connectPageMeta('contact', {
    title: 'Contact',
    description:
      'Message us on WhatsApp, or email karibu@pumziko.org. We reply within a day.',
    path: '/contact',
  });

  readonly people = toSignal(
    this.peopleService.list().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  readonly site = toSignal(
    this.siteService.settings().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly submitting = signal(false);
  readonly done = signal(false);
  readonly error = signal(false);

  draft: { name: string; method: ContactMethod; value: string; message: string } = {
    name: '',
    method: 'WhatsApp',
    value: '',
    message: '',
  };

  readonly whatsappHref = () => {
    const digits = (this.site()?.whatsapp_number ?? '').replace(/[^\d]/g, '');
    return digits
      ? `https://wa.me/${digits}?text=${encodeURIComponent('Hi Pumziko — ')}`
      : null;
  };

  submit(): void {
    if (!this.draft.value.trim()) return;
    this.submitting.set(true);
    this.error.set(false);
    this.contactService
      .sendEnquiry({
        name: this.draft.name.trim() || undefined,
        contact_method: this.draft.method,
        contact_value: this.draft.value.trim(),
        message: this.draft.message.trim() || undefined,
        source: 'Contact',
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.done.set(true);
        },
        error: () => {
          this.submitting.set(false);
          this.error.set(true);
        },
      });
  }
}
