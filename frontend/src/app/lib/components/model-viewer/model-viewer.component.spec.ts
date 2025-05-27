import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelViewerComponent } from './model-viewer.component';
import {provideRouter} from '@angular/router';

describe('ModelViewerComponent', () => {
  let component: ModelViewerComponent;
  let fixture: ComponentFixture<ModelViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelViewerComponent],
      providers: [
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeInstanceOf(ModelViewerComponent)
  });
});
