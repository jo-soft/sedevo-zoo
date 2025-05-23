import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject =
    new BehaviorSubject<boolean>(false);

  public readonly isLoading = this.loadingSubject.asObservable();

  public setLoading() {
    this.loadingSubject.next(true);
  }

  public unsetLoading() {
    this.loadingSubject.next(false);
  }
}
