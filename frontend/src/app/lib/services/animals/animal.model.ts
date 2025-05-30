import {IAnimal} from './animals.types';

export class Animal{

  public readonly id: number
  public readonly name: string;
  public readonly weight: number;
  public readonly extinctSince: number;
  public readonly superPower: string;
  public readonly model: string | null;

  public constructor(
    data: IAnimal
  ) {
    this.id = data.id
    this.name = data.name;
    this.weight = data.weight;
    this.extinctSince = data.extinct_since;
    this.superPower = data.super_power;
    this.model = data.model;
  }

}
