import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const base = environment.apiUrl.replace(/\/$/, '');
  const url = req.url.split('?')[0];
  if (!url.startsWith(base + '/') || url === base + '/auth/login')
    return next(req);
  const token = auth.token();
  const enviada = token ? req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }) : req;
  return next(enviada).pipe(catchError(erro => {
    if (erro.status === 401) {
      auth.logout();
      void router.navigate(['/login']);
    }
    // 403 é devolvido à tela; a sessão não é removida.
    return throwError(() => erro);
  }));
};