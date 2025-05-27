import { TestBed } from '@angular/core/testing';
import {  HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnimalGateway } from './animal.gateway';
import { IAnimal } from './animal.types';
import {HttpParams, provideHttpClient} from '@angular/common/http';

describe('AnimalGateway', () => {
  let service: AnimalGateway;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AnimalGateway
      ],
    });

    service = TestBed.inject(AnimalGateway);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch a list of animals', () => {
    const mockAnimals: IAnimal[] = [
      { id: 1, name: 'Lion', weight: 200, extinct_since: 0, super_power: 'Roar', model: null },
      { id: 2, name: 'Elephant', weight: 5000, extinct_since: 0, super_power: 'Strength', model: null },
    ];

    const params: HttpParams = new HttpParams()
      .append('order[]', 'name')
      .append('order[]', 'weight')
      .append('name', 'test');

    service.getAnimals(params).subscribe((animals) => {
      expect(animals.length).toBe(2);
      expect(animals[0].name).toBe('Lion');
    });

    const req = httpMock.expectOne(`/api/animals/animal/?${params.toString()}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAnimals);
  });

  it('should fetch a single animal by id', () => {
    const mockAnimal: IAnimal = { id: 1, name: 'Lion', weight: 200, extinct_since: 0, super_power: 'Roar', model: null };

    service.getAnimal(1).subscribe((animal) => {
      expect(animal.name).toBe('Lion');
    });

    const req = httpMock.expectOne('/api/animals/animal/1/');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnimal);
  });

  it('should delete an animal by ID', () => {
    service.deleteAnimal(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('/api/animals/animal/1/');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update an animal', () => {
    const mockAnimal: IAnimal = { id: 1, name: 'Lion', weight: 250, extinct_since: 0, super_power: 'Roar', model: null };
    const payload = { name: 'Lion', weight: 250, extinct_since: 0, super_power: 'Roar' };

    service.updateAnimal(1, payload).subscribe((animal) => {
      expect(animal.weight).toBe(250);
    });

    const req = httpMock.expectOne('/api/animals/animal/1/');
    expect(req.request.method).toBe('PUT');
    req.flush(mockAnimal);
  });

  it('should create a new animal', () => {
    const mockAnimal: IAnimal = { id: 3, name: 'Tiger', weight: 300, extinct_since: 0, super_power: 'Stealth', model: null };
    const payload = { name: 'Tiger', weight: 300, extinct_since: 0, super_power: 'Stealth' };

    service.createAnimal(payload).subscribe((animal) => {
      expect(animal.name).toBe('Tiger');
    });

    const req = httpMock.expectOne('/api/animals/animal/');
    expect(req.request.method).toBe('POST');
    req.flush(mockAnimal);
  });

  it('should upload a file for an animal', () => {
    const mockAnimal: IAnimal = { id: 1, name: 'Lion', weight: 200, extinct_since: 0, super_power: 'Roar', model: 'path/to/model-viewer.obj' };
    const mockFile = new File(['content'], 'model-viewer.obj', { type: 'application/octet-stream' });

    service.uploadFile(1, mockFile).subscribe((animal) => {
      expect(animal.model).toBe('path/to/model-viewer.obj');
    });

    const req = httpMock.expectOne('/api/animals/animal/1/upload/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.has('file')).toBeTrue();
    req.flush(mockAnimal);
  });
});
