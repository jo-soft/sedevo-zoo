import {Component, Output} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputComponent} from "../input/input.component";
import {IContractDetails} from "../../services/repayment-calculator/repayment-calculator.types";
import {map, Observable} from "rxjs";

interface IForm {
  amount: FormControl<number | null>
  normalInterestRate: FormControl<number | null>
  repaymentRate: FormControl<number | null>
  fixedInterestRate: FormControl<number | null>
}

type TForm = FormGroup<IForm>;


@Component({
  selector: 'app-form',
  imports: [
    InputComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {

  public readonly form: TForm = new FormGroup<IForm>({
    amount: new FormControl(null, [Validators.required, Validators.min(0)]),
    normalInterestRate: new FormControl(null, [Validators.required]),
    repaymentRate: new FormControl(null, [Validators.required, Validators.min(0)]),
    fixedInterestRate: new FormControl(null, [Validators.required, Validators.min(0)]),
  })

  @Output() public readonly valuesChanged: Observable<IContractDetails | null> = this.form.valueChanges.pipe(
      map(
          (value: TForm["value"]): IContractDetails | null => {
            const isValid: boolean = Object.values(value).every(
                (formValue: number | null): boolean => formValue !== null
            );
            return  isValid ? value as IContractDetails : null;
          }
      ),
  );
}