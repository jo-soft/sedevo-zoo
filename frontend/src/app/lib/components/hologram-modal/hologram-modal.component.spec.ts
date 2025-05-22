import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HologramModalComponent } from './hologram-modal.component';

describe('HologramModalComponent', () => {
  let component: HologramModalComponent;
  let fixture: ComponentFixture<HologramModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HologramModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HologramModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
