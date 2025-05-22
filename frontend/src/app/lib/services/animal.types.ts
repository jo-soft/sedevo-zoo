export interface IAnimal {
  type: "Animal",
  id: number,
  attributes: {
    name: string,
    weight: number,
    extinct_since: number,
    hologram: {
      id: number,
      file: string | null // todo adjust
    }
  }
}
export interface IAnimalsResponse {
  data: IAnimal[]
}
