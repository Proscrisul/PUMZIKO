import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideDynamicIcon } from '@lucide/angular';
import { catchError, of, Subscription, switchMap, take, takeWhile, timer } from 'rxjs';

import { GivingService } from '../../../core/services/giving.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { connectPageMeta } from '../page-seo';

type StkState = 'idle' | 'pushing' | 'waiting' | 'success' | 'failed' | 'timeout';

@Component({
  selector: 'app-give',
  imports: [FormsModule, LucideDynamicIcon, RestBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    /* Tighter block padding so a short page doesn't leave a void above the footer. */
    .section { padding-block: clamp(40px, 6vw, 72px); }
    .head { padding: 56px 24px 8px; text-align: center; }
    .head h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
    .head app-rest-bar { max-width: 300px; margin: 22px auto 0; }

    .visitors {
      max-width: 52ch; margin: 24px auto 0; text-align: center;
      font-family: var(--font-display); font-size: clamp(1.3rem, 4vw, 1.9rem);
      color: var(--ember); line-height: 1.15;
    }
    /* Centre the reading column so wide screens don't leave it hugging the left. */
    .intro { max-width: 56ch; color: var(--ink-70); margin: 28px auto 0; }
    .methods { margin: 28px auto 0; max-width: 56ch; }

    .method { padding: 24px 0; border-bottom: 1px solid var(--hairline); }
    .method:last-child { border-bottom: 0; }
    .method h2 { font-size: 1.4rem; margin-bottom: 12px; }
    dl { display: grid; grid-template-columns: 150px 1fr; gap: 10px 20px; margin: 0; }
    dt { color: var(--ink-55); font-size: 0.9rem; }
    dd { margin: 0; font-variant-numeric: tabular-nums; }

    .stk { max-width: 56ch; margin: 24px auto 0; padding: 22px; border: 1px solid var(--ember); border-radius: 2px; }
    .stk h2 { font-size: 1.3rem; margin-bottom: 6px; }
    .stk p.lead { color: var(--ink-70); margin-bottom: 16px; }
    .stk form { display: grid; gap: 14px; }
    .stk .two { display: grid; grid-template-columns: 1fr 140px; gap: 12px; }
    .stk .status { display: flex; align-items: center; gap: 10px; font-weight: 600; }
    .stk .status.ok { color: var(--ember); }
    .stk .status.bad { color: var(--ember); }
    .stk .spin { animation: spin 0.9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .stk .again { margin-top: 12px; }
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

          <div class="methods">
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

          @if (g.mpesa_stk_enabled) {
            <div class="stk">
              <h2>Give now by M-Pesa</h2>
              <p class="lead">Enter your number and an amount. You will get a prompt on your phone.</p>

              @switch (state()) {
                @case ('waiting') {
                  <p class="status ok">
                    <svg lucideIcon="loader-circle" [size]="18" class="spin"></svg>
                    Check your phone and enter your M-Pesa PIN…
                  </p>
                }
                @case ('success') {
                  <p class="status ok">
                    <svg lucideIcon="circle-check" [size]="18"></svg>
                    Thank you. @if (receipt()) { Receipt {{ receipt() }}. }
                  </p>
                }
                @case ('failed') {
                  <p class="status bad">{{ errorText() || 'That didn’t go through.' }}</p>
                  <button class="btn-ghost btn again" (click)="reset()">Try again</button>
                }
                @case ('timeout') {
                  <p class="status bad">We didn’t get a confirmation. If your money left, message us and we’ll check.</p>
                  <button class="btn-ghost btn again" (click)="reset()">Try again</button>
                }
                @default {
                  <form (ngSubmit)="pay()">
                    <label class="field">
                      <span>Your name (optional)</span>
                      <input class="input" name="name" [(ngModel)]="name" />
                    </label>
                    <div class="two">
                      <label class="field">
                        <span>Phone number</span>
                        <input class="input" name="phone" inputmode="tel"
                               [(ngModel)]="phone" placeholder="07…" required />
                      </label>
                      <label class="field">
                        <span>Amount (KES)</span>
                        <input class="input" name="amount" type="number" min="1"
                               [(ngModel)]="amount" required />
                      </label>
                    </div>
                    <button class="btn" type="submit"
                            [disabled]="state() === 'pushing' || !phone.trim() || !amount">
                      {{ state() === 'pushing' ? 'Sending…' : 'Send M-Pesa request' }}
                    </button>
                    @if (errorText()) { <p class="status bad">{{ errorText() }}</p> }
                  </form>
                }
              }
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class GiveComponent {
  private givingService = inject(GivingService);
  private payments = inject(PaymentsService);

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

  name = '';
  phone = '07';
  amount: number | null = null;

  readonly state = signal<StkState>('idle');
  readonly receipt = signal('');
  readonly errorText = signal('');

  private poll?: Subscription;

  pay(): void {
    if (!this.phone.trim() || !this.amount) return;
    this.state.set('pushing');
    this.errorText.set('');
    this.payments.stkPush({
      phone_number: this.phone.trim(),
      amount: this.amount,
      name: this.name.trim() || undefined,
    }).subscribe({
      next: res => this.startPolling(res.checkout_request_id),
      error: err => {
        this.state.set('idle');
        const detail = err?.error?.detail || err?.error?.phone_number?.[0] || err?.error?.amount?.[0];
        this.errorText.set(
          detail || 'Could not start the M-Pesa request. Try again in a moment.',
        );
      },
    });
  }

  private startPolling(checkoutId: string): void {
    this.state.set('waiting');
    this.poll?.unsubscribe();
    this.poll = timer(2500, 3000)
      .pipe(
        take(25),
        switchMap(() => this.payments.status(checkoutId).pipe(catchError(() => of(null)))),
        takeWhile(s => !s || s.status === 'Pending', true),
      )
      .subscribe({
        next: s => {
          if (!s) return;
          if (s.status === 'Success') {
            this.receipt.set(s.mpesa_receipt);
            this.state.set('success');
          } else if (s.status === 'Failed') {
            this.errorText.set(s.result_desc || '');
            this.state.set('failed');
          } else if (s.status === 'Timeout') {
            this.state.set('timeout');
          }
        },
        complete: () => {
          if (this.state() === 'waiting') this.state.set('timeout');
        },
      });
  }

  reset(): void {
    this.poll?.unsubscribe();
    this.state.set('idle');
    this.receipt.set('');
    this.errorText.set('');
    this.name = '';
    this.amount = null;
  }
}
