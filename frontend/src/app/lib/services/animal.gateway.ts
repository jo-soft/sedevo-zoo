import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {IAnimal, IAnimalsResponse} from './animal.types';
import {HttpClient} from '@angular/common/http';
import { Animal } from './animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalGateway {

  private readonly httpClient: HttpClient = inject(HttpClient)

  public getAnimals(): Observable<Animal[]> {

    return this.httpClient.get<IAnimalsResponse>('/api/animals/animal/').pipe(
      map(
        (resp: IAnimalsResponse) => resp.data.map(
          (animal: IAnimal) => new Animal(animal)
        )
      )
    )
  }
}
