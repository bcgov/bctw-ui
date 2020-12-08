import axios, { AxiosInstance } from 'axios';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { CreateUrlParams, RequestPingParams } from './api_interfaces';
import dayjs from 'dayjs';
import { appendQueryToUrl } from 'utils/api_helpers';
import { formatDay } from 'constants/time';

const IS_PROD = +(window.location.port) === 1111 ? false : true;

const getBaseUrl = (): string => {
  const h1 = window.location.protocol;
  const h2 = window.location.hostname;
  const h3 = IS_PROD ? window.location.port : 3000;
  const h4 = IS_PROD ? '/api' : '';
  let url = `${h1}//${h2}:${h3}${h4}`;
  return url;
}

const createUrl = ({api, query, page}: CreateUrlParams): string => {
  const baseUrl = getBaseUrl();
  let url = `${baseUrl}/${api}`;
  if (query && query.length) {
    url = appendQueryToUrl(url, query);
  }
  return url;
}

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

  return {
    usePingExtent,
    usePings,
  }
}