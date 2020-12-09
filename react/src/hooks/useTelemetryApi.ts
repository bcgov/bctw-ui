import axios, { AxiosInstance, AxiosError } from 'axios';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { ICritterResults, RequestPingParams } from './api_interfaces';
import dayjs from 'dayjs';
import { createUrl, getBaseUrl } from 'utils/api_helpers';
import { formatDay } from 'constants/time';

/**
 * Returns an instance of axios with baseURL set.
 *
 * @return {AxiosInstance}
 */
const useApi = (): AxiosInstance => {
  const instance = useMemo(() => {
    return axios.create({
      baseURL: getBaseUrl()
    });
  }, []);
  return instance;
};

/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 */
export const useTelemetryApi = () => {
  const api = useApi();

  const _requestPingExtent = async(): Promise<any> => {
    const url = createUrl({api: 'get-ping-extent'});
    const { data } = await api.get(url);
    return data;
  }
  const usePingExtent = () => useQuery<any, Error>('pingExtent', _requestPingExtent)

  const _requestPings = async(key: string, { timeWindow, pingExtent }: RequestPingParams): Promise<any> => {
    const start = dayjs(pingExtent).add(timeWindow[0], 'd').format(formatDay);
    const end = dayjs(pingExtent).add(timeWindow[1], 'd').format(formatDay);
    const url = createUrl({api: 'get-critters', query: `start=${start}&end=${end}`})
    console.log('requesting pings', start, end)
    const { data } = await api.get(url);
    return data;
  }

  const usePings = ({timeWindow, pingExtent}: RequestPingParams) => {
    return useQuery<any, Error>(['pings',{timeWindow, pingExtent}], _requestPings);
  }

  const _getCritters = async(): Promise<ICritterResults> => {
    const apiStr = 'get-animals';
    const urlAssigned = createUrl({api: apiStr, query: 'assigned=true'});
    const urlAvailable = createUrl({api: apiStr, query: 'assigned=false'});
    console.log('requesting critters');
    const dataAssigned = await api.get(urlAssigned);
    const dataAvail = await api.get(urlAvailable);
    return {
      assigned: dataAssigned.data,
      available: dataAvail.data
    }
  }
  const useCritters = () => useQuery<ICritterResults, AxiosError>('critters', _getCritters);

  return {
    usePingExtent,
    usePings,
    useCritters
  }
}