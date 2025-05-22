import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutputTableComponent } from './output-table.component';
import { IRepaymentData } from '../../services/repayment-calculator/repayment-calculator.types';
import { By } from '@angular/platform-browser';
import { TAdditionalRowData } from './output-table.types';
import {CurrencyPipe, DatePipe} from "@angular/common";
import {DateOrDescPipe} from "../../pipes/date-or-desc/date-or-desc.pipe";

describe('OutputTableComponent', () => {
  let component: OutputTableComponent;
  let fixture: ComponentFixture<OutputTableComponent>;

  let datePipe: DatePipe;
  let currencyPipe: CurrencyPipe;

  let repayments: IRepaymentData[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
          OutputTableComponent,
          DatePipe,
          DateOrDescPipe
      ],
      providers: [
          DatePipe,
          CurrencyPipe,
      ]
    }).compileComponents();

    datePipe = TestBed.inject(DatePipe);
    currencyPipe = TestBed.inject(CurrencyPipe);

    fixture = TestBed.createComponent(OutputTableComponent);
    component = fixture.componentInstance;

    repayments = [
      { date: new Date('2023-01-01'), remainingDebt: 100000, interest: 500, repayment: 1000, rate: 1500 },
      { date: new Date('2023-02-01'), remainingDebt: 99000, interest: 495, repayment: 1005, rate: 1500 },
    ];
    component.repayments = repayments;

  });

  it('should render all repayment rows correctly', () => {
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(repayments.length);

    rows.forEach((row, index) => {
      const cells = row.queryAll(By.css('td'));
      expect(cells[0].nativeElement.textContent.trim()).toBe(datePipe.transform(repayments[index].date));
      expect(cells[1].nativeElement.textContent.trim()).toBe(currencyPipe.transform(repayments[index].remainingDebt));
      expect(cells[2].nativeElement.textContent.trim()).toBe(currencyPipe.transform(repayments[index].interest));
      expect(cells[3].nativeElement.textContent.trim()).toBe(currencyPipe.transform(repayments[index].repayment));
      expect(cells[4].nativeElement.textContent.trim()).toBe(currencyPipe.transform(repayments[index].rate));
    });
  });

  it('should render firstRow and lastRow if provided', () => {
    const firstRow: TAdditionalRowData = { description: 'Start of Loan', remainingDebt: 100000, interest: 0, repayment: 0, rate: 0 };
    const lastRow: TAdditionalRowData = { description: 'End of Loan', remainingDebt: 0, interest: 0, repayment: 100000, rate: 0 };
    component.firstRow = firstRow;
    component.lastRow = lastRow;
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows[0].query(By.css('td')).nativeElement.textContent.trim()).toBe(firstRow.description);
    expect(rows[rows.length - 1].query(By.css('td')).nativeElement.textContent.trim()).toBe(lastRow.description);
  });
});