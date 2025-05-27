import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { By } from '@angular/platform-browser';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent], // Ensure the component is declared
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeInstanceOf(ModalComponent)
  });

  it('should display the title', () => {
    component.title = 'Test Title';
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('.modal-header > h2'));
    expect(titleElement).not.toBeNull();
    expect(titleElement.nativeElement.textContent).toContain('Test Title');
  });

  it('should display the close button with default text', () => {
    const closeButton = fixture.debugElement.query(By.css('.modal-close-btn'));
    expect(closeButton).toBeDefined()
    expect(closeButton.nativeElement.textContent).toContain('Schließen');
  });

  it('should display the dismiss button if dismissText is provided', () => {
    component.dismissText = 'Cancel';
    fixture.detectChanges();

    const dismissButton = fixture.debugElement.query(By.css('.modal-cancel-btn'));
    expect(dismissButton).toBeDefined()
    expect(dismissButton.nativeElement.textContent).toContain('Cancel');
  });

  it('should emit true when the close button is clicked', () => {
    spyOn(component.modalClose, 'emit');

    const closeButton = fixture.debugElement.query(By.css('.modal-close-btn'));
    closeButton.nativeElement.click();

    expect(component.modalClose.emit).toHaveBeenCalledOnceWith(true);
  });

  it('should emit false when the dismiss button is clicked', () => {
    component.dismissText = 'Cancel';
    fixture.detectChanges();
    spyOn(component.modalClose, 'emit');

    const dismissButton = fixture.debugElement.query(By.css('.modal-cancel-btn'));
    dismissButton.nativeElement.click();

    expect(component.modalClose.emit).toHaveBeenCalledOnceWith(false);
  });
});
