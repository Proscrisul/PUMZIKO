import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { GivingService } from '../../../core/services/giving.service';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { connectPageMeta } from '../page-seo';

@Component({
  selector: 'app-give',
  imports: [RestBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .head { padding: 56px 24px 8px; text-align: center; }
    .head h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
    .head app-rest-bar { max-width: 300px; margin: 22px auto 0; }

    .visitors {
      max-width: 52ch; margin: 24px auto 0; text-align: center;
      font-family: var(--font-display); font-size: clamp(1.3rem, 4vw, 1.9rem);
      color: var(--ember); line-height: 1.15;
    }
    .intro { max-width: 56ch; color: var(--ink-70); margin-top: 28px; }

    .method { padding: 24px 0; border-bottom: 1px solid var(--hairline); max-width: 56ch; }
    .method:last-child { border-bottom: 0; }
    .method h2 { font-size: 1.4rem; margin-bottom: 12px; }
    dl { display: grid; grid-template-columns: 150px 1fr; gap: 10px 20px; margin: 0; }
    dt { color: var(--ink-55); font-size: 0.9rem; }
    dd { margin: 0; font-variant-numeric: tabular-nums; }
  `],
  template: `
    <header class="head">
      <h1>Give</h1>
      <app-rest-bar />
      @if (giving(); as g) {
        <p class="visitors">{{ g.visitors_note }}</p>
      }
    </header>

    <section class="section">
      <div class="wrap">
        @if (giving(); as g) {
          @if (g.intro_note) { <p class="intro">{{ g.intro_note }}</p> }

          <div style="margin-top:28px">
            @if (g.mpesa_paybill || g.mpesa_till) {
              <div class="method">
                <h2>M-Pesa</h2>
                <dl>
                  @if (g.mpesa_paybill) { <dt>Paybill</dt><dd>{{ g.mpesa_paybill }}</dd> }
                  @if (g.mpesa_account) { <dt>Account</dt><dd>{{ g.mpesa_account }}</dd> }
                  @if (g.mpesa_till) { <dt>Till</dt><dd>{{ g.mpesa_till }}</dd> }
                </dl>
              </div>
            }

            @if (g.bank_account_number) {
              <div class="method">
                <h2>Bank transfer</h2>
                <dl>
                  <dt>Bank</dt><dd>{{ g.bank_name }}</dd>
                  <dt>Name</dt><dd>{{ g.bank_account_name }}</dd>
                  <dt>Account</dt><dd>{{ g.bank_account_number }}</dd>
                  @if (g.bank_branch) { <dt>Branch</dt><dd>{{ g.bank_branch }}</dd> }
                  @if (g.bank_swift) { <dt>SWIFT</dt><dd>{{ g.bank_swift }}</dd> }
                </dl>
              </div>
            }

            @if (g.card_url) {
              <div class="method">
                <h2>From outside Kenya</h2>
                <a [href]="g.card_url" target="_blank" rel="noopener" class="btn">Give by card</a>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class GiveComponent {
  private givingService = inject(GivingService);

  readonly meta = connectPageMeta('give', {
    title: 'Give',
    description:
      'How to give, for the person who goes looking for it. Visitors are not ' +
      'expected to give anything, ever.',
    path: '/give',
  });

  readonly giving = toSignal(
    this.givingService.info().pipe(catchError(() => of(null))),
    { initialValue: null },
  );
}
