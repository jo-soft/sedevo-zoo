import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  it('should emit a message when setMessage is called', (done) => {
    const testMessage = 'Test message';
    service.message$.subscribe((message) => {
      expect(message).toBe(testMessage);
      done();
    });
    service.setMessage(testMessage);
  });
});
