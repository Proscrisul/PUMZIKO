import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// Shared across in-flight requests so a burst of 401s triggers one refresh.
let refreshing = false;
const refreshed$ = new BehaviorSubject<string | null>(null);

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login/') || url.includes('/auth/refresh/');
}

/**
 * Attaches `Authorization: Bearer <access>` to admin/API calls, and on a 401
 * tries a single silent refresh + retry before giving up and sending the user
 * to the login screen.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const forApi = req.url.startsWith(environment.apiUrl);
  const token = auth.accessToken;

  const authReq =
    forApi && token && !isAuthEndpoint(req.url)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        !forApi ||
        isAuthEndpoint(req.url) ||
        !auth.refreshToken
      ) {
        return throwError(() => error);
      }

      if (refreshing) {
        return refreshed$.pipe(
          filter((t): t is string => t !== null),
          take(1),
          switchMap(t => next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }))),
        );
      }

      refreshing = true;
      refreshed$.next(null);
      return auth.refresh().pipe(
        switchMap(res => {
          refreshing = false;
          refreshed$.next(res.access);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.access}` } }));
        }),
        catchError(err => {
          refreshing = false;
          auth.clear();
          router.navigate(['/admin/login']);
          return throwError(() => err);
        }),
      );
    }),
  );
};
