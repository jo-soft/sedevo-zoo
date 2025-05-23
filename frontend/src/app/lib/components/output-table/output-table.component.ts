import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Animal} from '../../services/animal.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-output-table',
  templateUrl: './output-table.component.html',
  imports: [
    RouterLink
  ],
  styleUrl: './output-table.component.scss'
})
export class OutputTableComponent {

  @Input({ required: true}) public data: Animal[] = [];
  @Output() public onShowModelClick: EventEmitter<Animal> = new EventEmitter<Animal>();
  @Output() public onDeleteAnimalClicked: EventEmitter<Animal> = new EventEmitter<Animal>();


  public onShowModel(animal: Animal): void {
    this.onShowModelClick.emit(animal);
  }
}
