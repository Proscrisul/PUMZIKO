import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * The public site has no auth. This just normalises errors so components can
 * show a calm message instead of a stack trace; it never redirects.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => throwError(() => error)),
  );
};
