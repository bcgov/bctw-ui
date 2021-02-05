import { getBaseUrl } from 'api/api_helpers';
import { bulkApi as bulk_api } from 'api/bulk_api';
import { codeApi as code_api } from 'api/code_api';
import { collarApi as collar_api } from 'api/collar_api';
import { critterApi as critter_api } from 'api/critter_api';
import { mapApi as map_api } from 'api/map_api';
import { userApi as user_api } from 'api/user_api';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useMemo } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQuery, UseQueryResult } from 'react-query';
import { Animal } from 'types/animal';
import { ICode, ICodeHeader } from 'types/code';
import { Collar, ICollar } from 'types/collar';
import { CollarHistory } from 'types/collar_history';
import { User, UserCritterAccess } from 'types/user';

import {
  eCollarType,
  eCritterFetchType,
  IBulkUploadResults,
  ICollarLinkPayload,
  IGrantCritterAccessResults,
  IUpsertPayload,
  IUserCritterPermissionInput,
  RequestPingParams
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
export const useTelemetryApi = (): Record<string, unknown> => {
  const api = useApi();
  const collarApi = collar_api(api);
  const critterApi = critter_api(api);
  const codeApi = code_api(api);
  const bulkApi = bulk_api(api);
  const mapApi = map_api(api);
  const userApi = user_api(api);

  const defaultQueryOptions = {
    refetchOnWindowFocus: false
  };

  /**
   *
   */
  const usePingExtent = (): UseQueryResult =>
    useQuery<any, Error>('pingExtent', mapApi.requestPingExtent, defaultQueryOptions);

  /**
   *
   */
  const usePings = ({ timeWindow, pingExtent }: RequestPingParams): UseQueryResult => {
    return useQuery<any, Error>(['pings', { timeWindow, pingExtent }], () => mapApi.requestPings, defaultQueryOptions);
  };

  /**
   * @param type the collar types to be fetched (assigned, unassigned)
   */
  const useCollarType = (page: number, type: eCollarType, config: Record<string, unknown>): UseQueryResult => {
    const callapi = type === eCollarType.Assigned ? collarApi.getAssignedCollars : collarApi.getAvailableCollars;
    return useQuery<ICollar[], AxiosError>(['collartype', page, type], () => callapi(page), {
      ...config,
      ...defaultQueryOptions
    });
  };

  const critterOptions = { ...defaultQueryOptions, refetchOnMount: false, keepPreviousData: true };
  /**
   *  retrieves critters that have a collar assigned
   */
  const useAssignedCritters = (page: number): UseQueryResult => {
    return useQuery<Animal[], AxiosError>(
      ['a_critters', page],
      () => critterApi.getCritters(page, eCritterFetchType.assigned),
      critterOptions
    );
  };

  /**
   * retrieves critters not assigned to a collar
   */
  const useUnassignedCritters = (page: number): UseQueryResult =>
    useQuery<Animal[], AxiosError>(
      ['u_critters', page],
      () => critterApi.getCritters(page, eCritterFetchType.unassigned),
      critterOptions
    );

  /**
   * retrieves all critters, must be admin
   */
  const useAllCritters = (page: number): UseQueryResult =>
    useQuery<Animal[], AxiosError>(
      ['critters', page],
      () => critterApi.getCritters(page, eCritterFetchType.all),
      critterOptions
    );

  /**
   * @returns a list of critters representing the audist history of @param critterId
   */
  const useCritterHistory = (page: number, critterId: string, config: Record<string, unknown>): UseQueryResult => {
    return useQuery<Animal[], AxiosError>(
      ['critterHistory', critterId],
      () => critterApi.getCritterHistory(critterId),
      { ...config }
    );
  };

  /**
   * @param codeHeader the code header name used to determine which codes to fetch
   * @param page not currently used
   */
  const useCodes = (page: number, codeHeader: string): UseQueryResult => {
    const props = { page, codeHeader };
    return useQuery<ICode[], AxiosError>(['codes', props], () => codeApi.getCodes(props), { ...defaultQueryOptions });
  };

  /**
   * retrieves list of code headers, no parameters
   */
  const useCodeHeaders = (): UseQueryResult => {
    return useQuery<ICodeHeader[], AxiosError>('codeHeaders', () => codeApi.getCodeHeaders(), {
      ...defaultQueryOptions
    });
  };

  /**
   * @param critterId serial integer of the critter to be fetched (not animal_id)
   */
  const useCollarAssignmentHistory = (
    page: number,
    critterId: number,
    config: Record<string, unknown>
  ): UseQueryResult => {
    return useQuery<CollarHistory[], AxiosError>(
      ['collarAssignmentHistory', critterId],
      () => collarApi.getCollarAssignmentHistory(critterId),
      { ...config }
    );
  };

  /**
   * @returns a list of collars represnting the audit history of @param collarId
   */
  const useCollarHistory = (page: number, collarId: string, config: Record<string, unknown>): UseQueryResult => {
    return useQuery<Collar[], AxiosError>(['collarHistory', collarId], () => collarApi.getCollarHistory(collarId), {
      ...config
    });
  };

  /**
   * @returns a user object, no parameters because it uses the keycloak object to pass idir
   */
  const useUser = (): UseQueryResult => {
    return useQuery<User, AxiosError>('user', () => userApi.getUser(), defaultQueryOptions);
  };

  /**
   * requires admin role
   * @returns a list of all users
   */
  const useUsers = (page: number): UseQueryResult => {
    return useQuery<User[], AxiosError>('all_users', () => userApi.getUsers(page), {
      ...defaultQueryOptions
    });
  };

  /**
   * @param user idir of the user to receive critter access to
   * @returns A simplified list of Animals that only has id, animal_id, and nickname
   */
  const useCritterAccess = (page: number, user: string, config: Record<string, unknown>): UseQueryResult =>
    useQuery<UserCritterAccess[], AxiosError>(['critterAccess', page], () => userApi.getUserCritterAccess(page, user), {
      ...config,
      ...defaultQueryOptions
    });

  /**
   *
   * mutations
   */
  const useMutateCodeHeader = (
    config: UseMutationOptions<IBulkUploadResults<ICodeHeader>, AxiosError, ICodeHeader[]>
  ): UseMutationResult =>
    useMutation<IBulkUploadResults<ICodeHeader>, AxiosError, ICodeHeader[]>(
      (headers) => codeApi.addCodeHeader(headers),
      config
    );

  const useMutateCollar = (
    config: UseMutationOptions<IBulkUploadResults<Collar>, AxiosError, IUpsertPayload<Collar>>
  ): UseMutationResult =>
    useMutation<IBulkUploadResults<Collar>, AxiosError, IUpsertPayload<Collar>>(
      (collar) => collarApi.upsertCollar(collar),
      config
    );

  const useMutateCritter = (
    config: UseMutationOptions<Animal[], AxiosError, IUpsertPayload<Animal>>
  ): UseMutationResult =>
    useMutation<Animal[], AxiosError, IUpsertPayload<Animal>>((critter) => critterApi.upsertCritter(critter), config);

  const useMutateLinkCollar = (
    config: UseMutationOptions<CollarHistory, AxiosError, ICollarLinkPayload>
  ): UseMutationResult =>
    useMutation<CollarHistory, AxiosError, ICollarLinkPayload>((link) => critterApi.linkCollar(link), config);

  const useMutateBulkCsv = <T>(
    config: UseMutationOptions<IBulkUploadResults<T>, AxiosError, FormData>
  ): UseMutationResult =>
    useMutation<IBulkUploadResults<T>, AxiosError, FormData>((form) => bulkApi.uploadCsv(form), config);

  const useMutateGrantCritterAccess = (
    config: UseMutationOptions<IBulkUploadResults<IGrantCritterAccessResults>, AxiosError, IUserCritterPermissionInput>
  ): UseMutationResult =>
    useMutation<IBulkUploadResults<IGrantCritterAccessResults>, AxiosError, IUserCritterPermissionInput>(
      (body) => userApi.grantCritterAccessToUser(body),
      config
    );

  return {
    // queries
    useCodes,
    useCodeHeaders,
    usePingExtent,
    usePings,
    useCollarType,
    useAllCritters,
    useAssignedCritters,
    useUnassignedCritters,
    useCritterHistory,
    useCollarAssignmentHistory,
    useCollarHistory,
    useUser,
    useUsers,
    useCritterAccess,
    // mutations
    useMutateCodeHeader,
    useMutateBulkCsv,
    useMutateCollar,
    useMutateCritter,
    useMutateLinkCollar,
    useMutateGrantCritterAccess
  };
};
