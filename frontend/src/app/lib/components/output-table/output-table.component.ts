import { Component, Input } from '@angular/core';
import {Animal} from '../../services/animal.model';

@Component({
  selector: 'app-output-table',
  templateUrl: './output-table.component.html',
  styleUrl: './output-table.component.scss'
})
export class OutputTableComponent {


  @Input({ required: true}) public data: Animal[] = [];

}
