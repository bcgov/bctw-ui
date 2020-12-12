import { IAnimal } from 'types/animal';
import { ICollar } from 'types/collar';
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

interface ICollarLinkPayload {
  isLink: boolean;
  data: {
    animal_id: number,
    device_id: number,
    start_date: Date | string,
    end_date?: Date | string
  }
}

export type {
  RequestPingParams,
  ICritterResults,
  ICollarResults,
  ICollarLinkPayload
}
