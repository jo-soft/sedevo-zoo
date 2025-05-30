import {
  Component,
  inject,
  ResourceLoaderParams,
  ResourceRef,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import {AnimalsGateway} from '../../lib/services/animals/animals.gateway';
import {Animal} from '../../lib/services/animals/animal.model';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';
import {RouterLink} from '@angular/router';
import {debounceTime, firstValueFrom, map, merge, Observable} from 'rxjs';
import {ModalComponent} from '../../lib/components/modal/modal.component';
import {ModelViewerComponent} from '../../lib/components/model-viewer/model-viewer.component';
import {LoadingSpinnerComponent} from '../../lib/components/loading-spinner/loading-spinner.component';
import {ToastService} from '../../lib/services/toast/toast.service';
import {OrderButtonComponent} from '../../lib/components/order-button/order-button.component';
import {HttpParams} from '@angular/common/http';
import {InputComponent} from '../../lib/components/input/input.component';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {WebSocketService} from '../../lib/services/websocket/websockets.service';
import {AnimalWebsocketMessageTypeEnum, IAnimal} from '../../lib/services/animals/animals.types';
import {IWebsocketMessage} from '../../lib/services/websocket/websockets.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  private readonly gateway: AnimalsGateway = inject(AnimalsGateway)
  private readonly toast: ToastService = inject(ToastService)
  private readonly websocket: WebSocketService = inject(WebSocketService)

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
  public readonly formData: Signal<TFormData | undefined> = toSignal(
    this.searchForm.valueChanges.pipe(debounceTime(300))
  );

  public readonly animals: ResourceRef<Animal[]> = rxResource<Animal[], HttpParams>({
    defaultValue: [],
    request: () => {
      let params: HttpParams = new HttpParams();

      if(this.nameOrder()){
        params = params.append('order[]', this.nameOrder())
      }
      if(this.weightOrder()){
          params = params.append('order[]', this.weightOrder())
      }
      if(this.extinctSinceOrder()){
          params = params.append('order[]', this.extinctSinceOrder())
      }

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

  public constructor() {
    merge(
      this.getOnWebsocketUpdated$(),
      this.getupOnWebsocketDeleted$()
    )
    .pipe(
      takeUntilDestroyed()
    )
    .subscribe(
        (newAnimals: Animal[]) => {
          this.animals.set(newAnimals);
          this.toast.setMessage('Tiere wureden extern aktualisiert');
        }
      )
  }

  public showModelModal(animal:Animal): void {
    this.modelUrl = animal.model;
  }

  public hideModelModal(): void {
    this.modelUrl = null;
  }

  public async deleteAnimal(animal: Animal): Promise<void> {
    this.animalToDelete = animal;
  }

  public async onDeleteClosed(closed: boolean): Promise<void> {

    if(closed) {
      try {
        await firstValueFrom(this.gateway.deleteAnimal(this.animalToDelete!.id));
        this.animals.reload()
        this.toast.setMessage('Tier gelöscht');
      }
      catch {
        this.toast.setMessage('Oops, da ist etwas schief gelaufen');
      }
    }
    this.animalToDelete = null;
  }

  private getupOnWebsocketDeleted$(): Observable<Animal[]> {
    return this.websocket.subscribe<number, AnimalWebsocketMessageTypeEnum.Deleted>([AnimalWebsocketMessageTypeEnum.Deleted])
      .pipe(
        map((message: IWebsocketMessage<number, AnimalWebsocketMessageTypeEnum.Deleted>) => message.data),
        map(
          (animalId: number) =>
            this.animals.value().filter((animal: Animal) => animal.id !== animalId)
        ),
      )
  }

  private getOnWebsocketUpdated$(): Observable<Animal[]> {
    return this.websocket.subscribe<IAnimal, AnimalWebsocketMessageTypeEnum.Created | AnimalWebsocketMessageTypeEnum.Updated>
    ([AnimalWebsocketMessageTypeEnum.Updated, AnimalWebsocketMessageTypeEnum.Created])
      .pipe(
        map((message: IWebsocketMessage<IAnimal, AnimalWebsocketMessageTypeEnum.Created | AnimalWebsocketMessageTypeEnum.Updated>) => {
          const animal = new Animal(message.data);
          return message.type === AnimalWebsocketMessageTypeEnum.Created
            ? [...this.animals.value(), animal]
            : [...this.animals.value().filter((existingAnimal: Animal) => existingAnimal.id !== animal.id), animal];
        }),
    )
  }
}
