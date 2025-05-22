import {Component, inject, ResourceRef} from '@angular/core';
import {AnimalGateway} from '../../lib/services/animal.gateway';
import {Animal} from '../../lib/services/animal.model';
import { rxResource } from '@angular/core/rxjs-interop';
import {OutputTableComponent} from '../../lib/components/output-table/output-table.component';

@Component({
  selector: 'app-overview',
  imports: [
    OutputTableComponent
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

  private readonly gateway: AnimalGateway = inject(AnimalGateway)

  public readonly animals: ResourceRef<Animal[]> = rxResource<Animal[], void>({
    defaultValue: [],
    loader: () => this.gateway.getAnimals()
  })

}
