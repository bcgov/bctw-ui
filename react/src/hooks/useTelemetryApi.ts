import { createUrl, getBaseUrl } from 'api/api_helpers';
import { bulkApi as bulk_api } from 'api/bulk_api';
import { codeApi as code_api } from 'api/code_api';
import { collarApi as collar_api } from 'api/collar_api';
import { critterApi as critter_api } from 'api/critter_api';
import axios, { AxiosError, AxiosInstance } from 'axios';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { MutationConfig, QueryConfig, useMutation, usePaginatedQuery, useQuery } from 'react-query';
import { Animal } from 'types/animal';
import { ICode } from 'types/code';
import { ICollar } from 'types/collar';
import { CollarHistory } from 'types/collar_history';
import { formatDay } from 'utils/time';

import {
  eCollarType,
  IBulkUploadResults,
  ICollarLinkPayload,
  RequestPingParams,
} from '../api/api_interfaces';

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
  const bulkApi = bulk_api(api);

  const defaultQueryOptions = {
    refetchOnWindowFocus: false,
  }

  const _requestPingExtent = async (): Promise<any> => {
    const url = createUrl({ api: 'get-ping-extent' });
    const { data } = await api.get(url);
    return data;
  };
  const usePingExtent = () => useQuery<any, Error>('pingExtent', _requestPingExtent, defaultQueryOptions);

  const _requestPings = async (key: string, { timeWindow, pingExtent }: RequestPingParams): Promise<any> => {
    const start = dayjs(pingExtent).add(timeWindow[0], 'd').format(formatDay);
    const end = dayjs(pingExtent).add(timeWindow[1], 'd').format(formatDay);
    const url = createUrl({ api: 'get-critters', query: `start=${start}&end=${end}` });
    console.log('requesting pings', start, end);
    const { data } = await api.get(url);
    return data;
  };
  const usePings = ({ timeWindow, pingExtent }: RequestPingParams) => {
    return useQuery<any, Error>(['pings', { timeWindow, pingExtent }], _requestPings, defaultQueryOptions);
  };

  /**
   * @param type the collar types to be fetched (assigned, unassigned)
   */
  const useCollarType = (page: number, type: eCollarType, config: object) => {
    const callapi = type === eCollarType.Assigned ? collarApi.getAssignedCollars : collarApi.getAvailableCollars;
    return usePaginatedQuery<ICollar[], AxiosError>(
      ['collartype', page, type], callapi, {...config, ...defaultQueryOptions });
  }

  const useAssignedCritters = (page, _, config: object) => {
    return usePaginatedQuery<Animal[], AxiosError>(['a_critters', page], critterApi.getAssignedCritters, { ...defaultQueryOptions, ...config, refetchOnMount: false, keepPreviousData: true });
  }
  const useUnassignedCritters = (page: number, _, config: object) =>
    usePaginatedQuery<Animal[], AxiosError>(['u_critters', page], critterApi.getUnassignedCritters, { ...defaultQueryOptions, ...config, refetchOnMount: false, keepPreviousData: true });

  /**
   * @param codeHeader the code header name used to determine which codes to fetch
   * adds enabled = false to not auto refetch codes
   */
  const useCodes = (codeHeader: string) => useQuery<ICode[], AxiosError>(codeHeader, codeApi.getCodes, { ...defaultQueryOptions /*, enabled: false*/ });

  /**
   * @param critterId serial integer of the critter to be fetched (not animal_id)
   */
  const useCollarHistory = (page: number, critterId: number, config: object) => {
    return usePaginatedQuery<CollarHistory[], AxiosError>(['collarHistory', critterId], collarApi.getCollarHistory, { ...config });
  }


  /**     **
   *  *  * * 
   *   *   * utations
   *       *
   *       *
  */
  const useMutateCritter = (config?: MutationConfig<Animal[], AxiosError, Animal[]>) =>
    useMutation<Animal[], AxiosError, Animal[]>((critter) => critterApi.upsertCritter(critter), config);


  const useMutateLinkCollar = (config: MutationConfig<CollarHistory, AxiosError, ICollarLinkPayload>) =>
    useMutation<CollarHistory, AxiosError, ICollarLinkPayload>((link) => critterApi.linkCollar(link), config);


  const useMutateBulkCsv = <T,>(config: MutationConfig<IBulkUploadResults<T>, AxiosError, FormData>) =>
    useMutation<IBulkUploadResults<T>, AxiosError, FormData>((form) => bulkApi.uploadCsv(form), config);



  return {
    // queries
    useCodes,
    usePingExtent,
    usePings,
    useCollarType,
    useAssignedCritters,
    useUnassignedCritters,
    useCollarHistory,
    // mutations
    useMutateLinkCollar,
    useMutateCritter,
    useMutateBulkCsv,
  };
};
