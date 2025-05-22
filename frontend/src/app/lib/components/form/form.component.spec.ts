import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeInstanceOf(FormComponent);
  });

  describe('valueChange', () => {


    describe('if the form is valid', () => {

      it('should emit on valuesChanged', (done) => {
        const formValues = {
          amount: 1000,
          normalInterestRate: 0.05,
          repaymentRate: 0.02,
          fixedInterestRate: 0
        };

        component.valuesChanged.subscribe((emittedValue) => {
          expect(emittedValue).toEqual(formValues);
          done();
        });

        component.form.setValue(formValues);
      });

      it('should emit on valuesChanged even if a value is 0', (done) => {
        const formValues = {
          amount: 0,
          normalInterestRate: 0.05,
          repaymentRate: 0.02,
          fixedInterestRate: 0
        };

        component.valuesChanged.subscribe((emittedValue) => {
          expect(emittedValue).toEqual(formValues);
          done();
        });

        component.form.setValue(formValues);
      });

    })

    describe('if the form is invalid', () => {

      it('should emit null on valuesChanged if the form is invalid', (done) => {
        const invalidFormValues = {
          amount: null,
          normalInterestRate: 0.05,
          repaymentRate: 0.02,
          fixedInterestRate: 0
        };

        component.valuesChanged.subscribe((emittedValue) => {
          expect(emittedValue).toBeNull();
          done();
        });

        component.form.setValue(invalidFormValues);
      });
    })

  })
});
