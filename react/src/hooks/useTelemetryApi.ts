import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { useMemo } from 'react';
import { useQuery, useMutation, usePaginatedQuery } from 'react-query';
import { ICollarLinkPayload, ICollarResults, ICritterResults, RequestPingParams } from './api_interfaces';
import dayjs from 'dayjs';
import { createUrl, getBaseUrl } from 'hooks/api_helpers';
import { formatDay } from 'utils/time';
import { ICode } from 'types/code';
import { ICollarHistory } from 'types/collar';

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

  const _requestPingExtent = async (): Promise<any> => {
    const url = createUrl({ api: 'get-ping-extent' });
    const { data } = await api.get(url);
    return data;
  };
  const usePingExtent = () => useQuery<any, Error>('pingExtent', _requestPingExtent);

  const _requestPings = async (key: string, { timeWindow, pingExtent }: RequestPingParams): Promise<any> => {
    const start = dayjs(pingExtent).add(timeWindow[0], 'd').format(formatDay);
    const end = dayjs(pingExtent).add(timeWindow[1], 'd').format(formatDay);
    const url = createUrl({ api: 'get-critters', query: `start=${start}&end=${end}` });
    console.log('requesting pings', start, end);
    const { data } = await api.get(url);
    return data;
  };
  const usePings = ({ timeWindow, pingExtent }: RequestPingParams) => {
    return useQuery<any, Error>(['pings', { timeWindow, pingExtent }], _requestPings);
  };

  const _getCollars = async (key: string, page = 1): Promise<ICollarResults> => {
    const urlAssigned = createUrl({ api: 'get-assigned-collars', page });
    const urlAvailable = createUrl({ api:'get-available-collars', page });
    const results = await Promise.all([api.get(urlAssigned), api.get(urlAvailable)])
    return {
      assigned: results[0]?.data,
      available: results[1]?.data
    };
  }
  const useCollars = (page) => usePaginatedQuery<ICollarResults, AxiosError>(['collars', page], _getCollars);

  const _getCritters = async (key: string, page = 1): Promise<ICritterResults> => {
    const apiStr = 'get-animals';
    const urlAssigned = createUrl({ api: apiStr, query: 'assigned=true', page });
    const urlAvailable = createUrl({ api: apiStr, query: 'assigned=false', page });
    console.log(`requesting critters ${urlAssigned}`);
    const results = await Promise.all([api.get(urlAssigned), api.get(urlAvailable)])
    return {
      assigned: results[0]?.data,
      available: results[1]?.data
    };
  };
  const useCritters = (page) => usePaginatedQuery<ICritterResults, AxiosError>(['critters', page], _getCritters);

  const _getCodes = async (key: string, codeHeader: string): Promise<ICode[]> => {
    const url = createUrl({ api: 'get-code', query: `codeHeader=${codeHeader}` });
    console.log(`requesting ${codeHeader} codes`);
    const { data } = await api.get(url);
    return data[0];
  };
  const useCodes = (codeHeader: string) => useQuery<ICode[], AxiosError>(['codes', codeHeader], _getCodes);

  const _getCollarHistory = async (key: string, critterId: number): Promise<ICollarHistory[]> => {
    const url = createUrl({ api: `get-assignment-history/${critterId}` });
    console.log(`requesting collar history`);
    const { data } = await api.get(url);
    return data;
  };
  const useCollarHistory = (critterId: number) =>
    useQuery<ICollarHistory[], AxiosError>(['collarHistory', critterId], _getCollarHistory);

  const linkCollar = async (body: ICollarLinkPayload): Promise<string> => {
    const link = body.isLink ? 'link-animal-collar' : 'unlink-animal-collar';
    const url = createUrl({ api: link });
    console.log(`posting ${link}: ${JSON.stringify(body.data)}`);
    const { data } = await api.post(url, body);
    return data;
  };
  const useMutateCollarLink = (body: ICollarLinkPayload) => {
    const [mutate] = useMutation<string, AxiosError>(linkCollar);
    return mutate;
    // return mutate(body as any); // fixme: why do variables have type undefined?
  };

  return {
    // queries
    useCodes,
    usePingExtent,
    usePings,
    useCollars,
    useCritters,
    useCollarHistory,
    // mutations
    useMutateCollarLink,
    linkCollar
  };
};
