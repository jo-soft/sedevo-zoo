import {IAnimal} from './animal.types';

export class Animal{

  public readonly id: number
  public readonly name: string;
  public readonly weight: number;
  public readonly extinctSince: number;
  public readonly hologram: string | null;

  public constructor(
    data: IAnimal
  ) {
    this.id = data.id
    this.name = data.attributes.name;
    this.weight = data.attributes.weight;
    this.extinctSince = data.attributes.extinct_since;
    this.hologram = data.attributes.hologram.file;
  }

}
