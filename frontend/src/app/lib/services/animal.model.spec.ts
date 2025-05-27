import { Animal } from './animal.model';
import {IAnimal} from './animal.types';

describe('Animal Model', () => {


  let animalData: IAnimal;
  let instance: Animal;

  beforeEach(() => {
    animalData = {
      id: 1,
      name: 'Lion',
      weight: 200,
      extinct_since: 10000,
      super_power: 'Roar',
      model: 'path/to/model-viewer.obj'
    };
  })

  it('should create an instance of Animal', () => {
    instance = new Animal(animalData);
    expect(instance).toBeTruthy();
    expect(instance.name).toBe('Lion');
    expect(instance.weight).toBe(200);
    expect(instance.extinctSince).toBe(10000);
    expect(instance.superPower).toBe('Roar');
    expect(instance.model).toBe('path/to/model-viewer.obj');
  });
});
