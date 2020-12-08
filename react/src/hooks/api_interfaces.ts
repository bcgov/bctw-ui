interface CreateUrlParams {
  api: string;
  query?: string;
  page?: number;
}

interface RequestPingParams {
  timeWindow: number[];
  pingExtent: string;
}

export type {
  CreateUrlParams,
  RequestPingParams,
}