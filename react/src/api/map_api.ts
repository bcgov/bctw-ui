import { createUrl } from 'api/api_helpers';
import { ITelemetryPoint, ITelemetryLine } from 'types/map';
import { API, ApiProps } from './api_interfaces';

export const mapApi = (props: ApiProps): API => {
  const { api } = props;

  const getTracks = async (start: string, end: string, unassigned = false): Promise<ITelemetryLine[]> => {
    const url = createUrl({ api: 'get-critter-tracks', query: `start=${start}&end=${end}&unassigned=${unassigned}` });
    const { data } = await api.get(url);
    return data?.features;
  };

  const getPings = async (start: string, end: string, unassigned = false): Promise<ITelemetryPoint[]> => {
    const url = createUrl({ api: 'get-critters', query: `start=${start}&end=${end}&unassigned=${unassigned}` });
    const { data } = await api.get(url);
    return data?.features;
  };

  return {
    getPings,
    getTracks
  };
};
