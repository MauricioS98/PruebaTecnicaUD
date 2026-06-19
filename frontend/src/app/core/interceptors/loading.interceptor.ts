import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoadingOverlayService } from '../services/loading-overlay.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!shouldTrack(req.url)) {
    return next(req);
  }

  const loading = inject(LoadingOverlayService);
  loading.show();

  return next(req).pipe(finalize(() => loading.hide()));
};

function shouldTrack(url: string): boolean {
  return url.startsWith(environment.apiUrl);
}
