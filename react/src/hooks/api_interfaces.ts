import { IAnimal } from "types/animal";
import { ICollar } from "types/collar";

interface RequestPingParams {
  timeWindow: number[];
  pingExtent: string;
}

interface ICritterResults {
  assigned: IAnimal[];
  available: IAnimal[];
}

interface ICollarResults {
  assigned: ICollar[];
  available: ICollar[]
}

export type {
  RequestPingParams,
  ICritterResults,
  ICollarResults
}
