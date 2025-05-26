import {Component, inject, ResourceLoaderParams, ResourceRef, signal, Signal, WritableSignal} from '@angular/core';
import {AnimalGateway} from '../../lib/services/animal.gateway';
import {Animal} from '../../lib/services/animal.model';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';import {RouterLink} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {ModalComponent} from '../../lib/components/modal/modal.component';
import {ModelViewerComponent} from '../../lib/components/model/model.component';
import {LoadingSpinnerComponent} from '../../lib/components/loading-spinner/loading-spinner.component';
import {ToastService} from '../../lib/services/toast.service';
import {OrderButtonComponent} from '../../lib/components/order-button/order-button.component';
import {HttpParams} from '@angular/common/http';
import {InputComponent} from '../../lib/components/input/input.component';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

interface IForm {
  name: FormControl<string | null>
  weight: FormControl<number| null>
  extinctSince: FormControl<number| null>
}

type TFormData = Partial<{
  [k in keyof IForm]: IForm[k]['value']
}>;

@Component({
  selector: 'app-overview',
  imports: [
    RouterLink,
    ModalComponent,
    ModelViewerComponent,
    LoadingSpinnerComponent,
    OrderButtonComponent,
    InputComponent,
    ReactiveFormsModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

  private readonly gateway: AnimalGateway = inject(AnimalGateway)
  private readonly toast: ToastService = inject(ToastService)

  public modelUrl: string | null = null
  public animalToDelete: Animal | null = null

  public searchForm = new FormGroup<IForm>(
    {
      name: new FormControl<string | null>(null),
      weight: new FormControl<number | null>(null),
      extinctSince: new FormControl<number | null>(null)
    }
  )

  public readonly nameOrder: WritableSignal<string>  = signal<string>('')
  public readonly weightOrder: WritableSignal<string> = signal<string>('')
  public readonly extinctSinceOrder: WritableSignal<string> = signal<string>('')
  public readonly formData: Signal<TFormData | undefined> = toSignal(this.searchForm.valueChanges);

  public readonly animals: ResourceRef<Animal[]> = rxResource<Animal[], HttpParams>({
    defaultValue: [],
    request: () => {
      let params: HttpParams = new HttpParams()
        .append('order[]', this.nameOrder())
        .append('order[]', this.weightOrder())
        .append('order[]', this.extinctSinceOrder())

      const name: string | null = this.formData()?.name ?? null;
      const weight: number | null = this.formData()?.weight ?? null;
      const extinctSince: number | null = this.formData()?.extinctSince ?? null;

        if (name) {
          params = params.append('name', name)
        }

        if(weight) {
          params = params.append('weight', weight)
        }

        if (extinctSince)  {
          params = params.append('extinct_since', extinctSince)
        }

      return params;
    },
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
}
