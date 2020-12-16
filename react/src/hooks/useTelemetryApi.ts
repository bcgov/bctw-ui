import axios, { AxiosInstance, AxiosError } from 'axios';
import { useMemo } from 'react';
import { useQuery, useMutation, usePaginatedQuery } from 'react-query';
import {
  eCollarType,
  ICollarLinkPayload,
  ICollarResults,
  ICritterResults,
  RequestPingParams
} from '../api/api_interfaces';
import dayjs from 'dayjs';
import { createUrl, getBaseUrl } from 'api/api_helpers';
import { formatDay } from 'utils/time';
import { ICode } from 'types/code';
import { ICollar, ICollarHistory, ICollarLinkResult } from 'types/collar';
import { collarApi as collar_api } from 'api/collar_api';
import { critterApi as critter_api } from 'api/critter_api';
import { codeApi as code_api } from 'api/code_api';

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
  const collarApi = collar_api(api);
  const critterApi = critter_api(api);
  const codeApi = code_api(api);

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

  const useCollars = (page: number) =>
    usePaginatedQuery<ICollarResults, AxiosError>(['collars', page], collarApi.getCollars);

  const useCollarType = (page: number, type: eCollarType) =>
    usePaginatedQuery<ICollar[], AxiosError>(
      ['collartype', page, type],
      type === eCollarType.Assigned ? collarApi.getAssignedCollars : collarApi.getAvailableCollars
    );

  const useCritters = (page) =>
    usePaginatedQuery<ICritterResults, AxiosError>(['critters', page], critterApi.getCritters);

  const useCodes = (codeHeader: string) => useQuery<ICode[], AxiosError>(codeHeader, codeApi.getCodes);

  const useCollarHistory = (critterId: number) =>
    useQuery<ICollarHistory[], AxiosError>(['collarHistory', critterId], collarApi.getCollarHistory);

  // const useMutateCollarLink = (body: ICollarLinkPayload) => {
  //   const [mutate] = useMutation(critterApi.linkCollar, body as any);
  //   return mutate;
  // };

  return {
    // queries
    useCodes,
    usePingExtent,
    usePings,
    useCollars,
    useCollarType,
    useCritters,
    useCollarHistory,
    // mutations
    linkCollar: critterApi.linkCollar,
    upsertCritter: critterApi.upsertCritter,
  };
};
