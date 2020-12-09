interface RequestPingParams {
  timeWindow: number[];
  pingExtent: string;
}

interface ICritterResults {
  assigned: object[];
  available: object[];
}

interface ICollarResults extends ICritterResults {

}

export type {
  RequestPingParams,
  ICritterResults,
  ICollarResults
}
