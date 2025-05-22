import {Component, inject, ResourceRef} from '@angular/core';
import {AnimalGateway} from '../../lib/services/animal.gateway';
import {Animal} from '../../lib/services/animal.model';
import { rxResource } from '@angular/core/rxjs-interop';
import {OutputTableComponent} from '../../lib/components/output-table/output-table.component';
import {HologramModalComponent} from '../../lib/components/hologram-modal/hologram-modal.component';
import {RouterLink} from '@angular/router';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-overview',
  imports: [
    OutputTableComponent,
    HologramModalComponent,
    RouterLink
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

  private readonly gateway: AnimalGateway = inject(AnimalGateway)

  public hologramUrl: string | null = null

  public readonly animals: ResourceRef<Animal[]> = rxResource<Animal[], void>({
    defaultValue: [],
    loader: () => this.gateway.getAnimals()
  })

  public async deleteAnimal(animal: Animal): Promise<void> {
    const confirmed = confirm(`Are you sure you want to delete ${animal.name}?`);
    if (!confirmed) {
      return;
    }
    await firstValueFrom(this.gateway.deleteAnimal(animal.id));
    this.animals.reload()
  }

  public showHologramModal(animal:Animal): void {
    this.hologramUrl = animal.hologram;
  }

  public hideHologramModal(): void {
    this.hologramUrl = null;
  }

}
