import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {LoadingService} from '../../services/loading.service';
import {AsyncPipe} from '@angular/common';
import {LoadingSpinnerComponent} from '../loading-spinner/loading-spinner.component';
import {ToastService} from '../../services/toast.service';
import {concatMap, delay, map, merge, Observable, of} from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    AsyncPipe,
    LoadingSpinnerComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly toastTimeout: number = 2000;

  public loadingService: LoadingService = inject(LoadingService)
  public toastService: ToastService = inject(ToastService)

  public messages$: Observable<string | null> = merge(
    this.toastService.message$,
    this.toastService.message$.pipe(
      delay(this.toastTimeout),
      map(() => null)
    ).pipe(
      concatMap(
        (msg: string | null) => msg ? of(msg).pipe(
          delay(this.toastTimeout)
        ) : of(null)
      )
    )
  );
}
