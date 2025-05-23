import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() public title: string | null = null;
  @Input() public closeText: string = "Schließen";
  @Input() public dismissText: string | null = null;
  @Output() public close: EventEmitter<boolean> = new EventEmitter<boolean>();
}
