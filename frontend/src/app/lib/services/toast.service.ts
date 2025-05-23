import { Injectable } from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private _message$: Subject<string> = new Subject<string>();

  public message$ = this._message$.asObservable();

  public constructor() { }

  public setMessage(message: string): void {
    this._message$.next(message);
  }
}
