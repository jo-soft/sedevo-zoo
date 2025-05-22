import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Animal} from '../../lib/services/animal.model';
import {InputComponent} from '../../lib/components/input/input.component';
import {AnimalGateway} from '../../lib/services/animal.gateway';
import {ActivatedRoute} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {TAnimalPayload} from '../../lib/services/animal.types';

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
    ReactiveFormsModule
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent  implements OnInit {

  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly gateway: AnimalGateway = inject(AnimalGateway);

  private animalId: number | null = null
  private newFile: File | null = null;

  public readonly form: FormGroup<IForm> = new FormGroup<IForm>({
    name: new FormControl(null, {validators: [Validators.required, Validators.maxLength(100)]}),
    weight: new FormControl(null, {validators: [Validators.min(0)]}),
    superPower: new FormControl(null, {validators: [Validators.maxLength(100)]}),
    extinctSince: new FormControl(null, {validators: [Validators.min(0)]}),
    model: new FormControl(null)
  })

  public ngOnInit(): void {
    this.animalId = this.route.snapshot.params['id'];
    if (this.animalId)  {
      this.gateway.getAnimal(this.route.snapshot.params['id']).subscribe((animal: Animal) => {
//        this.animal = animal;
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
    if (this.form.invalid) {
      return;
    }

    const data: TAnimalPayload = {
      name: this.form.value.name!,
      weight: this.form.value.weight!,
      extinct_since: this.form.value.extinctSince!,
      super_power: this.form.value.superPower || '',
    }



    if (this.route.snapshot.params['id']) {
      await firstValueFrom(this.gateway.updateAnimal(this.animalId!, data));
    }
    else {
      const newAnimal: Animal = await firstValueFrom(this.gateway.createAnimal(data));
      this.animalId = newAnimal.id;
    }

    if(this.newFile) {
      await firstValueFrom(this.gateway.uploadFile(this.animalId!, this.newFile));
    }

  }

}
