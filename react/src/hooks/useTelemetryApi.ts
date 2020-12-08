import axios, { AxiosInstance } from 'axios';
import { useMemo } from 'react';

const IS_PROD = +(window.location.port) === 1111 ? false : true;

interface CreateUrlParams {
  api: string;
  query?: string;
  page?: number;
}

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

  const requestPingExtent = async(): Promise<any> => {
    const url = createUrl({api: 'get-ping-extent'});
    const { data } = await api.get(url);
    return data;
  }

  return {
    requestPingExtent,
  }
}