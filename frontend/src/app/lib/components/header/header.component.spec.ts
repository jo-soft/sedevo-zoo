import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideRouter } from '@angular/router';
import { LoadingService } from '../../services/loading/loading.service';
import { ToastService } from '../../services/toast/toast.service';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let toastMessage$: Subject<string | null>;

  beforeEach(async () => {
    toastMessage$ = new Subject<string | null>();

    const toastServiceMock : jasmine.SpyObj<ToastService> = jasmine.createSpyObj(
      'ToastService',
      [], {
      message$: toastMessage$
      });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: LoadingService, useValue: { isLoading: of(false) } },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeInstanceOf(HeaderComponent);
  });

  it('should display a toast message', () => {
    toastMessage$.next('Test Message');
    fixture.detectChanges();

    const toastElement = fixture.debugElement.query(By.css('.toast'));
    expect(toastElement).toBeTruthy();
    expect(toastElement.nativeElement.textContent).toContain('Test Message');
  });

  it('should clear the toast message after the timeout', fakeAsync(() => {
    toastMessage$.next('Test Message');
    fixture.detectChanges();

    tick(component['toastTimeout'] + 100); // Add a small buffer to ensure timeout
    fixture.detectChanges();

    const toastElement = fixture.debugElement.query(By.css('.toast'));
    expect(toastElement).toBeNull();
  }));

  it('should ensure every toast message stays visible for at least 2 seconds', fakeAsync(() => {
    const messages = ['Message 1', 'Message 2', 'Message 3'];

    messages.forEach((message) => {
      toastMessage$.next(message);
      fixture.detectChanges();

      const toastElement = fixture.debugElement.query(By.css('.toast'));
      expect(toastElement.nativeElement.textContent).toContain(message);

      tick(component['toastTimeout']); // Simulate the timeout for each message
    });

    // After all messages, the toast should be cleared
    tick(component['toastTimeout']);
    fixture.detectChanges();

    const toastElement = fixture.debugElement.query(By.css('.toast'));
    expect(toastElement).toBeNull();
  }));
});
