export interface IAnimal {
  id: number;
  name: string,
  weight: number,
  extinct_since: number,
  super_power: string,
  model: string | null;
}

export type TAnimalPayload =  Omit<IAnimal, 'model' | 'id'>
