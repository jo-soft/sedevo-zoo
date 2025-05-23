import {Component, inject, ResourceLoaderParams, ResourceRef, signal, Signal, WritableSignal} from '@angular/core';
import {AnimalGateway} from '../../lib/services/animal.gateway';
import {Animal} from '../../lib/services/animal.model';
import {rxResource, RxResourceOptions} from '@angular/core/rxjs-interop';
import {RouterLink} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {ModalComponent} from '../../lib/components/modal/modal.component';
import {ModelViewerComponent} from '../../lib/components/model/model.component';
import {LoadingSpinnerComponent} from '../../lib/components/loading-spinner/loading-spinner.component';
import {ToastService} from '../../lib/services/toast.service';
import {OrderButtonComponent} from '../../lib/components/order-button/order-button.component';
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-overview',
  imports: [
    RouterLink,
    ModalComponent,
    ModelViewerComponent,
    LoadingSpinnerComponent,
    OrderButtonComponent
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

  private readonly gateway: AnimalGateway = inject(AnimalGateway)
  private readonly toast: ToastService = inject(ToastService)

  public modelUrl: string | null = null
  public animalToDelete: Animal | null = null

  public nameOrder: WritableSignal<string>  = signal<string>('')
  public weightOrder: WritableSignal<string> = signal<string>('')
  public extinctSinceOrder: WritableSignal<string> = signal<string>('')

  public readonly animals: ResourceRef<Animal[]> = rxResource<Animal[], HttpParams>({
    defaultValue: [],
    request: () =>
      new HttpParams()
        .append('order[]', this.nameOrder())
        .append('order[]', this.weightOrder())
        .append('order[]', this.extinctSinceOrder()),
    loader: (params: ResourceLoaderParams<HttpParams> ) =>
      this.gateway.getAnimals(params.request)
  })

  public async deleteAnimal(animal: Animal): Promise<void> {
    this.animalToDelete = animal;
  }

  public showModelModal(animal:Animal): void {
    this.modelUrl = animal.model;
  }

  public hideModelModal(): void {
    this.modelUrl = null;
  }

  public async onDeleteConfirmClosed(closed: boolean): Promise<void> {

    if(closed) {
      await firstValueFrom(this.gateway.deleteAnimal(this.animalToDelete!.id));
      this.animals.reload()
      this.toast.setMessage('Tier gelöscht');
    }
    this.animalToDelete = null;

  }

  protected readonly eval = eval;
}
