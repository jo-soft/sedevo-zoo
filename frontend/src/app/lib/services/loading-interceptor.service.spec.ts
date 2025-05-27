import { TestBed } from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import { LoadingInterceptor } from './loading-interceptor.service';
import { LoadingService } from './loading.service';

describe('LoadingInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let loadingServiceMock: jasmine.SpyObj<LoadingService>;



  beforeEach(() => {
    loadingServiceMock = jasmine.createSpyObj('loadingService', ['setLoading', 'unsetLoading']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: LoadingService,
          useValue: loadingServiceMock,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoadingInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call setLoading and unsetLoading during an HTTP request', () => {
    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(loadingServiceMock.setLoading).toHaveBeenCalledTimes(1);
    req.flush({});
    expect(loadingServiceMock.unsetLoading).toHaveBeenCalledTimes(1);
  });

  it('should reset loading state even if the request fails', () => {
    httpClient.get('/test').subscribe({
      error: () => {
        expect(loadingServiceMock.unsetLoading).toHaveBeenCalledTimes(1);
      },
    });

    const req = httpMock.expectOne('/test');
    expect(loadingServiceMock.setLoading).toHaveBeenCalledTimes(1);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
