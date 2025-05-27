import {inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import { LoadingService } from './loading.service';
import {throwError, catchError, finalize, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingInterceptor   implements HttpInterceptor {

  private loadingService: LoadingService = inject(LoadingService)

  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.loadingService.setLoading();

    return next.handle(req).pipe(
      catchError(
        (error) => {
          this.loadingService.unsetLoading();
          return throwError(error);
        }
      ),
      finalize(() => this.loadingService.unsetLoading()),
    );
  }
}
