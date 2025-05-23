import {Component, EventEmitter, Input, Output} from '@angular/core';


enum OrderEnum {
    Ascending = 'asc',
    Descending = 'desc'
}

@Component({
  selector: 'app-order-by-button',
  imports: [],
  templateUrl: './order-button.component.html',
  styleUrl: './order-button.component.css'
})
export class OrderButtonComponent {
  @Input({ required: true}) field!: string;
  @Output() order: EventEmitter<string> = new EventEmitter<string>();

  public orderDirection: OrderEnum | null = null;

  public readonly orderEnum: typeof OrderEnum = OrderEnum

  public toggleOrder(): void {
    if (this.orderDirection === OrderEnum.Ascending) {
      this.orderDirection = OrderEnum.Descending;
      this.order.emit(this.field);
    } else if (this.orderDirection === OrderEnum.Descending) {
      this.orderDirection = null;
      this.order.emit('');
    } else {
      this.orderDirection = OrderEnum.Ascending;
      this.order.emit(`-${this.field}`);
    }


  }
}
