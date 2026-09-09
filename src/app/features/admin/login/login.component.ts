import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { WordmarkComponent } from '../../../shared/components/wordmark/wordmark.component';
import { BrandIconComponent } from '../../../shared/components/brand-icon/brand-icon.component';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, WordmarkComponent, BrandIconComponent, RestBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
    }
    .box { width: 100%; max-width: 380px; text-align: center; }
    .box app-brand-icon { display: block; margin: 0 auto 14px; }
    .box app-rest-bar { max-width: 220px; margin: 18px auto 28px; }
    form { text-align: left; display: grid; gap: 14px; }
    .err { color: var(--ember); font-size: 0.9rem; }
  `],
  template: `
    <div class="box">
      <app-brand-icon [size]="56" />
      <app-wordmark [size]="56" />
      <app-rest-bar />

      <form (ngSubmit)="submit()">
        <label class="field">
          <span>Email</span>
          <input class="input" type="email" name="email" autocomplete="username"
                 [(ngModel)]="email" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input class="input" type="password" name="password" autocomplete="current-password"
                 [(ngModel)]="password" required />
        </label>
        <button class="btn" type="submit" [disabled]="loading() || !email || !password">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
        @if (error()) { <p class="err">{{ error() }}</p> }
      </form>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal('');

  submit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        const next = this.route.snapshot.queryParamMap.get('next') || '/admin';
        this.router.navigateByUrl(next);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(
          err?.status === 401 ? 'Wrong email or password.' : 'Could not sign in. Try again.',
        );
      },
    });
  }
}
