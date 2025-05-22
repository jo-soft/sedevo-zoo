export interface IAnimal {
  id: number;
  name: string,
  weight: number,
  extinct_since: number,
  super_power: string,
  hologram: string | null;
}

export type TAnimalPayload =  Omit<IAnimal, 'hologram' | 'id'>
