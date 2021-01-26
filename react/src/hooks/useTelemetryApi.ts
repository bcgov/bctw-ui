import { getBaseUrl } from 'api/api_helpers';
import { bulkApi as bulk_api } from 'api/bulk_api';
import { codeApi as code_api } from 'api/code_api';
import { collarApi as collar_api } from 'api/collar_api';
import { critterApi as critter_api } from 'api/critter_api';
import { userApi as user_api } from 'api/user_api';
import { mapApi as map_api } from 'api/map_api';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useMemo } from 'react';
import { useMutation, useQuery, UseMutationOptions, UseMutationResult, UseQueryResult } from 'react-query';
import { Animal } from 'types/animal';
import { ICode, ICodeHeader } from 'types/code';
import { Collar, ICollar } from 'types/collar';
import { CollarHistory } from 'types/collar_history';

import {
  eCollarType,
  IBulkUploadResults,
  ICollarLinkPayload,
  IUpsertPayload,
  RequestPingParams,
} from '../api/api_interfaces';
import { UserRole } from 'types/user';

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
export const useTelemetryApi = (): Record<string, unknown> => {
  const api = useApi();
  const collarApi = collar_api(api);
  const critterApi = critter_api(api);
  const codeApi = code_api(api);
  const bulkApi = bulk_api(api);
  const mapApi = map_api(api);
  const userApi = user_api(api);

  const defaultQueryOptions = {
    refetchOnWindowFocus: false,
  }

  /**
   * 
   */
  const usePingExtent = (): UseQueryResult => useQuery<any, Error>('pingExtent', mapApi.requestPingExtent, defaultQueryOptions);

  /**
   * 
   */
  const usePings = ({ timeWindow, pingExtent }: RequestPingParams): UseQueryResult => {
    return useQuery<any, Error>(['pings', { timeWindow, pingExtent }], () =>  mapApi.requestPings, defaultQueryOptions);
  };

  /**
   * @param type the collar types to be fetched (assigned, unassigned)
   */
  const useCollarType = (page: number, type: eCollarType, config: Record<string, unknown>): UseQueryResult => {
    const callapi = type === eCollarType.Assigned ? collarApi.getAssignedCollars : collarApi.getAvailableCollars;
    return useQuery<ICollar[], AxiosError>(
      ['collartype', page, type], () => callapi(page), { ...config, ...defaultQueryOptions });
  }

  /**
   *  retrieves critters that have a collar assigned
   */
  const useAssignedCritters = (page: number, config: Record<string, unknown>): UseQueryResult => {
    return useQuery<Animal[], AxiosError>(['a_critters', page], () => critterApi.getAssignedCritters(page), { ...defaultQueryOptions, ...config, refetchOnMount: false, keepPreviousData: true });
  }

  /**
   * retrieves critters not assigned to a collar
   */
  const useUnassignedCritters = (page: number, config: Record<string, unknown>): UseQueryResult =>
    useQuery<Animal[], AxiosError>(['u_critters', page], () => critterApi.getUnassignedCritters(page), { ...defaultQueryOptions, ...config, refetchOnMount: false, keepPreviousData: true });

  /**
   * @param codeHeader the code header name used to determine which codes to fetch
   * @param page not currently used
   */
  const useCodes = (page: number, codeHeader: string): UseQueryResult => {
    const props = {page, codeHeader}
    return useQuery<ICode[], AxiosError>(['codes', props], () => codeApi.getCodes(props), { ...defaultQueryOptions });
  }

  /**
   * retrieves list of code headers, no parameters
   */
  const useCodeHeaders = (): UseQueryResult => {
    return useQuery<ICodeHeader[], AxiosError>('codeHeaders', () => codeApi.getCodeHeaders(), { ...defaultQueryOptions });
  }

  /**
   * @param critterId serial integer of the critter to be fetched (not animal_id)
   */
  const useCollarHistory = (page: number, critterId: number, config: Record<string, unknown>): UseQueryResult => {
    return useQuery<CollarHistory[], AxiosError>(['collarHistory', critterId], () => collarApi.getCollarHistory(critterId), { ...config });
  }

  /**
   * @param config 
   * @returns
   */
  const useUserRole = (): UseQueryResult => useQuery<UserRole, AxiosError>('userRole', () => userApi.requestUserRole())

  /**
   * 
   * mutations
   */
  const useMutateCollar = (config: UseMutationOptions<IBulkUploadResults<Collar>, AxiosError, IUpsertPayload<Collar>>): UseMutationResult => 
    useMutation<IBulkUploadResults<Collar>, AxiosError, IUpsertPayload<Collar>>((collar) => collarApi.upsertCollar(collar), config);

  const useMutateCritter = (config: UseMutationOptions<Animal[], AxiosError, IUpsertPayload<Animal>>): UseMutationResult => 
    useMutation<Animal[], AxiosError, IUpsertPayload<Animal>>((critter) => critterApi.upsertCritter(critter), config);
 
  const useMutateLinkCollar = (config: UseMutationOptions<CollarHistory, AxiosError, ICollarLinkPayload>): UseMutationResult => 
    useMutation<CollarHistory, AxiosError, ICollarLinkPayload>((link) => critterApi.linkCollar(link), config);

  const useMutateBulkCsv = <T,>(config: UseMutationOptions<IBulkUploadResults<T>, AxiosError, FormData>): UseMutationResult => 
    useMutation<IBulkUploadResults<T>, AxiosError, FormData>((form) => bulkApi.uploadCsv(form), config);



  return {
    // queries
    useCodes,
    useCodeHeaders,
    usePingExtent,
    usePings,
    useCollarType,
    useAssignedCritters,
    useUnassignedCritters,
    useCollarHistory,
    useUserRole,
    // mutations
    useMutateBulkCsv,
    useMutateCollar,
    useMutateCritter,
    useMutateLinkCollar,
  };
};