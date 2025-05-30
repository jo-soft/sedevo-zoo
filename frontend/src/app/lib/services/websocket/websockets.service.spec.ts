import { TestBed } from '@angular/core/testing';
import {WebSocketProvider, WebSocketService} from './websockets.service';
import {Subject} from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { fakeAsync } from '@angular/core/testing';
import { IWebsocketMessage } from './websockets.types';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let subject: Subject<unknown>;
  let webSocketSpy: jasmine.SpyObj<typeof webSocket<unknown>>;

  beforeEach(() => {
    subject = new Subject<unknown>()
    webSocketSpy = jasmine.createSpy('webSocket').and.returnValue(subject);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WebSocketProvider.provide,
          useValue: webSocketSpy
        }
      ]
    });
    service = TestBed.inject(WebSocketService);
  });

  describe('WebSocketProvider', () => {
    it('should provide rxjs/webSocket', () => {
      expect(WebSocketProvider.useValue).toBe(webSocket);
    });
  })

  describe('constructor', () => {

    it('should create a WebSocket connection', () => {
      const url: URL = new URL('/api/animals/ws/', location.href);
      url.protocol = 'ws';
      expect(webSocketSpy).toHaveBeenCalledWith(url.toString());
    });
  })

  describe('ngOnDestroy', () => {

    let completeSpy: jasmine.Spy;

    beforeEach(() => {
      completeSpy = spyOn(subject, 'complete');
    })

    it('should complete the WebSocket subject', () => {
      service.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalledTimes(1)
    });
  })

  describe('subscribe', () => {
    let mockMessage: IWebsocketMessage<{ data: string }, 'testType'>;

    beforeEach(() => {
      mockMessage = {type: 'testType', data: {data: 'testData'}};
    });

    describe('if the message type is included in the provided types', () => {

      it('should receive messages of the specified type', (done) => {
        service.subscribe(['testType']).subscribe((message) => {
          expect(message).toEqual(mockMessage);
          done();
        });

        subject.next(mockMessage);
      });

    });

    describe('if the message type is not included in the provided types', () => {
      it('should not receive messages of the specified type', fakeAsync(() => {
        const tester: jasmine.Spy = jasmine.createSpy('tester');
        service.subscribe(['otherType']).subscribe(tester);

        subject.next(mockMessage);
        expect(tester).not.toHaveBeenCalled();

      }))
    });

    describe('if the message type is included in the provided types', () => {

      const mockMessages = [
        { type: 'testType', message: { data: 'testData1' } },
        { type: 'anotherType', message: { data: 'testData2' } },
      ];


      it('should receive all messages of the specified types', fakeAsync(() => {
        const tester: jasmine.Spy = jasmine.createSpy('tester');
        service.subscribe(['testType', 'anotherType']).subscribe(tester)

        mockMessages.forEach((msg) => subject.next(msg));

        expect(tester).toHaveBeenCalledTimes(2);
        expect(tester.calls.allArgs()).toEqual([
          [mockMessages[0]],
          [mockMessages[1]]
        ])
      }))
    });

    describe('if the message type is not included in the provided types', () => {

      let mockMessages: IWebsocketMessage<unknown, unknown>[];

      beforeEach(
        () => {
          mockMessages = [
            { type: 'testType', data: { data: 'testData1' } },
            { type: 'anotherType', data: { data: 'testData2' } },
          ];
        }
      )

      it('should not receive any messages of the specified types', fakeAsync(() => {
        const tester: jasmine.Spy = jasmine.createSpy('tester');
        service.subscribe(['nonMatchingType']).subscribe(tester);

        mockMessages.forEach((msg) => subject.next(msg));

        expect(tester).not.toHaveBeenCalled();
      }));
    });
  })
})
