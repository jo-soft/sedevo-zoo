import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Animal} from '../../lib/services/animals/animal.model';
import {InputComponent} from '../../lib/components/input/input.component';
import {AnimalsGateway} from '../../lib/services/animals/animals.gateway';
import {ActivatedRoute, Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {TAnimalPayload} from '../../lib/services/animals/animals.types';
import {ModelViewerComponent} from '../../lib/components/model-viewer/model-viewer.component';
import {ToastService} from '../../lib/services/toast/toast.service';

interface IForm {
  name: FormControl<string | null>
  weight: FormControl<number | null>
  superPower: FormControl<string | null>
  extinctSince: FormControl<number | null>
  model: FormControl<File | null>
}
@Component({
  selector: 'app-edit',
  imports: [
    InputComponent,
    ReactiveFormsModule,
    ModelViewerComponent
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent  implements OnInit {

  public modelUrl: string | null = null

  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly gateway: AnimalsGateway = inject(AnimalsGateway);
  private readonly toast: ToastService = inject(ToastService)
  private readonly router: Router = inject(Router);

  private animalId: number | null = null
  private newFile: File | null = null;

  public readonly form: FormGroup<IForm> = new FormGroup<IForm>({
    name: new FormControl(null, {validators: [Validators.required, Validators.maxLength(100)]}),
    weight: new FormControl(null, {validators: [Validators.required, Validators.min(0)]}),
    superPower: new FormControl(null, {validators: [Validators.required, Validators.maxLength(100)]}),
    extinctSince: new FormControl(null, {validators: [Validators.required, Validators.min(0)]}),
    model: new FormControl(null)
  })

  public ngOnInit(): void {
    this.animalId = this.route.snapshot.params['id'];
    if (this.animalId) {
      this.gateway.getAnimal(this.route.snapshot.params['id']).subscribe((animal: Animal) => {
        this.modelUrl = animal.model;
        this.form.patchValue({
          name: animal.name,
          weight: animal.weight,
          superPower: animal.superPower,
          extinctSince: animal.extinctSince
        })
      })
    }
  }

  public onFileInoutChange(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newFile = input.files[0];
    }
  }

  public async save(): Promise<void> {
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      return;
    }

    const data: TAnimalPayload = {
      name: this.form.value.name!,
      weight: this.form.value.weight!,
      extinct_since: this.form.value.extinctSince!,
      super_power: this.form.value.superPower || '',
    }

    try {
      if (this.route.snapshot.params['id']) {
        await firstValueFrom(this.gateway.updateAnimal(this.animalId!, data));
      } else {
        const newAnimal: Animal = await firstValueFrom(this.gateway.createAnimal(data));
        this.animalId = newAnimal.id;
      }

      if (this.newFile) {
        await firstValueFrom(this.gateway.uploadFile(this.animalId!, this.newFile));
      }
      this.toast.setMessage('Tier gespeichert');
      await this.router.navigate([''])
    }
    catch {
      this.toast.setMessage('Ooops, da ist etwas schiefgelaufen');
    }
  }
}
