import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ModelViewerComponent} from '../hologram/hologram.component';

@Component({
  selector: 'app-hologram-modal',
  imports: [
    ModelViewerComponent
  ],
  templateUrl: './hologram-modal.component.html',
  styleUrl: './hologram-modal.component.css'
})
export class HologramModalComponent {
  @Input({ required: true }) public path!: string;
  @Input() public title: string | null = null;
  @Output() public close: EventEmitter<void> = new EventEmitter<void>();

}
