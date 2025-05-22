import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {IAnimal, TAnimalPayload} from './animal.types';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Animal } from './animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalGateway {

  private readonly httpClient: HttpClient = inject(HttpClient)

  public getAnimals(): Observable<Animal[]> {

    return this.httpClient.get<IAnimal[]>('/api/animals/animal/').pipe(
      map(
        (resp: IAnimal[]) => resp.map(
          (animal: IAnimal) => new Animal(animal)
        )
      )
    )
  }

  public getAnimal(id: number): Observable<Animal>{
    return this.httpClient.get<IAnimal>(`/api/animals/animal/${id}/`).pipe(
      map(
        (animal: IAnimal) => new Animal(animal)
      )
    )
  }

  public deleteAnimal(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/animals/animal/${id}/`)
  }

  public updateAnimal(id: number, data: TAnimalPayload): Observable<Animal> {
    return this.httpClient.put<IAnimal>(`/api/animals/animal/${id}/`, data).pipe(
      map(
        (animal: IAnimal) => new Animal(animal)
      )
    )
  }

  public createAnimal(data: TAnimalPayload): Observable<Animal> {
    return this.httpClient.post<IAnimal>(`/api/animals/animal/`, data).pipe(
      map(
        (animal: IAnimal) => new Animal(animal)
      )
    )
  }

  public uploadFile(id: number, file: File): Observable<Animal> {
    return this.httpClient.post<IAnimal>(
      `/api/animals/animal/${id}/upload/`,
      {file},
      {headers: new HttpHeaders({
          'content-type': file.type,
          'Content-Disposition': `attachment; filename="${file.name}"`
      })}
    ).pipe(
      map(
        (animal: IAnimal) => new Animal(animal)
      )
    )
  }
}
