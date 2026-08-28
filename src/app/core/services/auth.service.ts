import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminUser, AuthTokens, LoginResponse } from '../models/user.model';

const ACCESS_KEY = 'pz_access';
const REFRESH_KEY = 'pz_refresh';
const USER_KEY = 'pz_user';

/**
 * JWT auth for the admin. Access + refresh tokens live in localStorage; the
 * auth interceptor attaches the bearer and refreshes once on a 401. On the
 * server there is no storage, so SSR always renders as logged out (the admin
 * routes are client-rendered anyway).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private base = environment.apiUrl;

  private readonly _user = signal<AdminUser | null>(this.readUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user() && !!this.accessToken);

  get accessToken(): string | null {
    return this.storageGet(ACCESS_KEY);
  }
  get refreshToken(): string | null {
    return this.storageGet(REFRESH_KEY);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/auth/login/`, { email, password })
      .pipe(tap(res => this.persist(res.tokens, res.user)));
  }

  /** Exchange the refresh token for a fresh access token. */
  refresh(): Observable<{ access: string; refresh?: string }> {
    return this.http
      .post<{ access: string; refresh?: string }>(`${this.base}/auth/refresh/`, {
        refresh: this.refreshToken,
      })
      .pipe(
        tap(res => {
          this.storageSet(ACCESS_KEY, res.access);
          if (res.refresh) this.storageSet(REFRESH_KEY, res.refresh);
        }),
      );
  }

  logout(): void {
    const refresh = this.refreshToken;
    if (refresh) {
      this.http.post(`${this.base}/auth/logout/`, { refresh }).subscribe({
        next: () => {},
        error: () => {},
      });
    }
    this.clear();
  }

  private persist(tokens: AuthTokens, user: AdminUser): void {
    this.storageSet(ACCESS_KEY, tokens.access);
    this.storageSet(REFRESH_KEY, tokens.refresh);
    this.storageSet(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  clear(): void {
    this.storageRemove(ACCESS_KEY);
    this.storageRemove(REFRESH_KEY);
    this.storageRemove(USER_KEY);
    this._user.set(null);
  }

  private readUser(): AdminUser | null {
    const raw = this.storageGet(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  }

  private storageGet(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  private storageSet(key: string, value: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      /* private mode / blocked */
    }
  }
  private storageRemove(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
