import { createUrl } from 'api/api_helpers';
import { ITelemetryPoint, ITelemetryLine } from 'types/map';
import { API, ApiProps } from './api_interfaces';

export const mapApi = (props: ApiProps): API => {
  const { api } = props;

  const getEstimate = async (start: string, end: string): Promise<any> => {
    const url = createUrl({api: 'get-pings-estimate', query:  `start=${start}&end=${end}`});
    const { data } = await api.get(url);
    return data;
  }

  const getTracks = async (start: string, end: string, critter_id: string): Promise<ITelemetryLine[]> => {
     const queryBody = critter_id ?  `start=${start}&end=${end}&critter_id=${critter_id}` : `start=${start}&end=${end}`;
    const url = createUrl({ api: 'get-critter-tracks', query: queryBody });
    const { data } = await api.get(url);
    return data?.features;
  };

  const getPings = async (start: string, end: string, critter_id: string): Promise<ITelemetryPoint[]> => {
    const queryBody = critter_id ?  `start=${start}&end=${end}&critter_id=${critter_id}` : `start=${start}&end=${end}`;
    const url = createUrl({ api: 'get-critters', query: queryBody });
    const { data } = await api.get(url);
    return data?.features;
  };

  return {
    getPings,
    getTracks,
    getEstimate
  };
};
