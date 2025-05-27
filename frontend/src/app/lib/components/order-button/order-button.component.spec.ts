import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderButtonComponent } from './order-button.component';
import { By } from '@angular/platform-browser';

describe('OrderButtonComponent', () => {
  let component: OrderButtonComponent;
  let fixture: ComponentFixture<OrderButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderButtonComponent);
    component = fixture.componentInstance;
    component.field = 'testField';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeInstanceOf(OrderButtonComponent);
  });

  it('should emit the correct value when the button is clicked', () => {
    const emitSpy: jasmine.Spy = spyOn(component.order, 'emit');

    const button = fixture.debugElement.query(By.css('button'));

    button.nativeElement.click();
    expect(emitSpy).toHaveBeenCalledOnceWith('-testField');

    emitSpy.calls.reset()
    button.nativeElement.click();
    expect(emitSpy).toHaveBeenCalledOnceWith('testField');

    emitSpy.calls.reset()
    button.nativeElement.click();
    expect(emitSpy).toHaveBeenCalledOnceWith('');
  });

  it('should update the button content based on the order direction', () => {
    const button = fixture.debugElement.query(By.css('button'));

    button.nativeElement.click();
    fixture.detectChanges();
    expect(button.nativeElement.textContent.trim()).toBe('↑');

    button.nativeElement.click();
    fixture.detectChanges();
    expect(button.nativeElement.textContent.trim()).toBe('↓');

    button.nativeElement.click();
    fixture.detectChanges();
    expect(button.nativeElement.textContent.trim()).toBe('⇅');
  });
});
