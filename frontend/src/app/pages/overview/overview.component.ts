import {Component, inject, ResourceRef} from '@angular/core';
import {AnimalGateway} from '../../lib/services/animal.gateway';
import {Animal} from '../../lib/services/animal.model';
import { rxResource } from '@angular/core/rxjs-interop';
import {OutputTableComponent} from '../../lib/components/output-table/output-table.component';
import {RouterLink} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {ModalComponent} from '../../lib/components/modal/modal.component';
import {ModelViewerComponent} from '../../lib/components/hologram/hologram.component';
import {LoadingSpinnerComponent} from '../../lib/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-overview',
  imports: [
    OutputTableComponent,
    RouterLink,
    ModalComponent,
    ModelViewerComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

  private readonly gateway: AnimalGateway = inject(AnimalGateway)

  public hologramUrl: string | null = null
  public animalToDelete: Animal | null = null

  public readonly animals: ResourceRef<Animal[]> = rxResource<Animal[], void>({
    defaultValue: [],
    loader: () => this.gateway.getAnimals()
  })

  public async deleteAnimal(animal: Animal): Promise<void> {
    this.animalToDelete = animal;
  }

  public showHologramModal(animal:Animal): void {
    this.hologramUrl = animal.hologram;
  }

  public hideHologramModal(): void {
    this.hologramUrl = null;
  }

  public async onDeleteConfirmClosed(closed: boolean): Promise<void> {

    if(closed) {
      await firstValueFrom(this.gateway.deleteAnimal(this.animalToDelete!.id));
      this.animals.reload()
    }
    this.animalToDelete = null;

  }

}
