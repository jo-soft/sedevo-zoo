import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import {firstValueFrom} from 'rxjs';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit true when setLoading is called', async () => {
    service.setLoading();
    await expectAsync(firstValueFrom(service.isLoading)).toBeResolvedTo(true);
  });

  it('should emit false when unsetLoading is called', async () => {
    service.setLoading(); // Set loading to true first
    service.setLoading();
    await expectAsync(firstValueFrom(service.isLoading)).toBeResolvedTo(true);
    service.unsetLoading();
    await expectAsync(firstValueFrom(service.isLoading)).toBeResolvedTo(false);
  });
});
