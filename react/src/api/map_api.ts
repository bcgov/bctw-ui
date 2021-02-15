import { createUrl } from 'api/api_helpers';
import { ApiProps } from './api_interfaces';
import {GeoJSON} from 'leaflet';

export const mapApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const getTracks = async (start: string, end: string): Promise<GeoJSON.GeoJsonObject> => {
    const url = createUrl({ api: 'get-critter-tracks', query: `start=${start}&end=${end}`, testUser });
    const { data } = await api.get(url);
    return data?.features;
  };
  const getPingExtent = async (): Promise<any> => {
    const url = createUrl({ api: 'get-ping-extent', testUser });
    const { data } = await api.get(url);
    return data;
  };

  const getPings = async (start: string, end: string): Promise<GeoJSON.GeoJsonObject> => {
    const url = createUrl({ api: 'get-critters', query: `start=${start}&end=${end}`, testUser });
    const { data } = await api.get(url);
    return data?.features;
  };

  return {
    getPings,
    getPingExtent,
    getTracks
  };
};
