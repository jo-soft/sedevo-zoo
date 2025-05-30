import {inject, Injectable, InjectionToken, OnDestroy, ValueProvider} from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import {filter, Observable} from 'rxjs';
import {IWebsocketMessage} from './websockets.types';

// needed for testing, otherwise one runs into  webSocket is not declared writable or has no setter error
const WebSocketToken: InjectionToken<typeof webSocket> = new InjectionToken<typeof webSocket>('RxJS WebSocket Token');
export const WebSocketProvider: ValueProvider = {
  provide: WebSocketToken,
  useValue: webSocket
};

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy{
  private readonly webSocket: typeof webSocket= inject(WebSocketToken)
  private socket$: WebSocketSubject<IWebsocketMessage<unknown, string>>;

  constructor() {
    const url: URL = new URL('/api/animals/ws/', location.href);
    url.protocol = 'ws';
    this.socket$ = this.webSocket(url.toString());
  }

  public subscribe<TRes, TType extends  string>( type: TType[] ): Observable<IWebsocketMessage<TRes, TType>> {
    return this.socket$.pipe(
      filter(
        (message: IWebsocketMessage<unknown, string>): message is  IWebsocketMessage<TRes, TType>  => type.includes(message.type as TType)
      )
    )
  }

  public ngOnDestroy () {
    this.socket$.complete();
  }
}
