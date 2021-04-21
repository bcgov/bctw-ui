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
import { Collar, eCollarAssignedStatus } from 'types/collar';
import { CollarHistory } from 'types/collar_history';
import { User, UserCritterAccess } from 'types/user';

import {
  eCritterFetchType,
  IBulkUploadResults,
  ICollarLinkPayload,
  IDeleteType,
  IGrantCritterAccessResults,
  IUpsertPayload,
  IUserCritterPermissionInput
} from '../api/api_interfaces';
import { UserContext } from 'contexts/UserContext';
import { useContext } from 'react';
import { TelemetryAlert } from 'types/alert';
import { BCTW, TypeWithData } from 'types/common_types';
import { exportQueryParams } from 'types/export';
import { eUDFType, IUDF, IUDFInput } from 'types/udf';
import { ITelemetryFeature, ITracksFeature } from 'types/map';

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

  const userContext = useContext(UserContext);
  const testUser = userContext.testUser;

  const collarApi = collar_api({ api, testUser });
  const critterApi = critter_api({ api, testUser });
  const codeApi = code_api({ api, testUser });
  const bulkApi = bulk_api(api);
  const mapApi = map_api({ api, testUser });
  const userApi = user_api({ api, testUser });

  const defaultQueryOptions = {
    refetchOnWindowFocus: false
  };

  /**
   *
   */
  const useTracks = (start: string, end: string): UseQueryResult<ITracksFeature[], AxiosError> => {
    return useQuery<ITracksFeature[], AxiosError>(
      ['tracks', start, end],
      () => mapApi.getTracks(start, end),
      defaultQueryOptions
    );
  };

  /**
   *
   */
  const usePings = (start: string, end: string, unassigned?: boolean): UseQueryResult<ITelemetryFeature[], AxiosError> => {
    return useQuery<ITelemetryFeature[], AxiosError>(
      ['pings', { start, end, unassigned }],
      () => mapApi.getPings(start, end, unassigned),
      defaultQueryOptions
    );
  };

  /**
   * @param type the collar types to be fetched (assigned, unassigned)
   */
  const useCollarType = (
    page: number,
    type: eCollarAssignedStatus,
    config: Record<string, unknown>
  ): UseQueryResult<Collar[]> => {
    const callapi =
      type === eCollarAssignedStatus.Assigned ? collarApi.getAssignedCollars : collarApi.getAvailableCollars;
    return useQuery<Collar[], AxiosError>(['collartype', page, type], () => callapi(page), {
      ...config,
      ...defaultQueryOptions
    });
  };

  const critterOptions = { ...defaultQueryOptions /*refetchOnMount: false, keepPreviousData: true */ };
  /**
   *  retrieves critters that have a collar assigned
   */
  const useAssignedCritters = (page: number): UseQueryResult<Animal[]> => {
    return useQuery<Animal[], AxiosError>(
      ['critters_assigned', page],
      () => critterApi.getCritters(page, eCritterFetchType.assigned),
      critterOptions
    );
  };

  /**
   * retrieves critters not assigned to a collar
   */
  const useUnassignedCritters = (page: number): UseQueryResult<Animal[]> =>
    useQuery<Animal[], AxiosError>(
      ['critters_unassigned', page],
      () => critterApi.getCritters(page, eCritterFetchType.unassigned),
      critterOptions
    );

  /**
   * retrieves all critters, must be admin
   */
  const useAllCritters = (page: number): UseQueryResult<Animal[]> =>
    useQuery<Animal[], AxiosError>(
      ['critters', page],
      () => critterApi.getCritters(page, eCritterFetchType.all),
      critterOptions
    );

  /**
   * @returns a list of critters representing the audist history of @param critterId
   */
  const useCritterHistory = (page: number, critterId: string): UseQueryResult<Animal[]> => {
    return useQuery<Animal[], AxiosError>(
      ['critter_history', critterId, page],
      () => critterApi.getCritterHistory(page, critterId),
      critterOptions
    );
  };

  /**
   * @param codeHeader the code header name used to determine which codes to fetch
   * @param page not currently used
   */
  const useCodes = (page: number, codeHeader: string): UseQueryResult<ICode[], AxiosError> => {
    const props = { page, codeHeader };
    return useQuery<ICode[], AxiosError>(['codes', props], () => codeApi.getCodes(props), {
      ...defaultQueryOptions,
      refetchOnMount: false
    });
  };

  /**
   * retrieves list of code headers, no parameters
   */
  const useCodeHeaders = (): UseQueryResult<ICodeHeader[], AxiosError> => {
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
  ): UseQueryResult<CollarHistory[]> => {
    return useQuery<CollarHistory[], AxiosError>(
      ['collarAssignmentHistory', critterId],
      () => collarApi.getCollarAssignmentHistory(critterId),
      { ...config }
    );
  };

  /**
   * @returns a list of collars represnting the audit history of @param collarId
   */
  const useCollarHistory = (page: number, collarId: string, config?: Record<string, unknown>): UseQueryResult => {
    return useQuery<Collar[], AxiosError>(['collarHistory', collarId], () => collarApi.getCollarHistory(collarId), {
      ...config
    });
  };

  /**
   * @returns a user object, no parameters because it uses the keycloak object to pass idir
   */
  const useUser = (): UseQueryResult<User, AxiosError> => {
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
   * @returns A simplified list of Animals that only has id, animal_id,
   * note: query keys are important! make sure to include params in the key
   */
  const useCritterAccess = (page: number, param: { user: string; filterOutNone: boolean }): UseQueryResult<UserCritterAccess[], AxiosError> => {
    const { user, filterOutNone } = param;
    return useQuery<UserCritterAccess[], AxiosError>(
      ['critterAccess', page, user],
      () => userApi.getUserCritterAccess(page, user, filterOutNone),
      {
        ...defaultQueryOptions
        // ...defaultQueryOptions, ...{refetchOnMount: false}
      }
    );
  };

  /**
   * @returns
   */
  const useAlert = (): UseQueryResult<TelemetryAlert[]> => {
    return useQuery<TelemetryAlert[], AxiosError>(['userAlert'], () => userApi.getUserAlerts(), {
      ...defaultQueryOptions
    });
  };

  /** default type getter for animals or collars
   * @returns
   */
  const useType = <T extends BCTW>(type: TypeWithData, id: string): UseQueryResult<T> => {
    return useQuery<T, AxiosError>(['getType', type], () => bulkApi.getType(type, id), {
      ...defaultQueryOptions
    });
  };

  /**
   * 
  */
  const useUDF = (type: eUDFType): UseQueryResult<IUDF[]> => {
    return useQuery<IUDF[], AxiosError>(['getUDF', type], () => userApi.getUDF(type), {
      ...defaultQueryOptions /*, ...{refetchOnMount: true} */
    });
  }

  /**
   * 
  */
  const useExport = (config: UseMutationOptions<string[], AxiosError, exportQueryParams>): UseMutationResult<string[]> => {
    return useMutation<string[], AxiosError, exportQueryParams>((body) => bulkApi.getExportData(body), config);
  };

  /**
   *
   * mutations
   * 
   */

  /** save a code header */
  const useMutateCodeHeader = (
    config: UseMutationOptions<IBulkUploadResults<ICodeHeader>, AxiosError, ICodeHeader[]>
  ): UseMutationResult<IBulkUploadResults<ICodeHeader>> =>
    useMutation<IBulkUploadResults<ICodeHeader>, AxiosError, ICodeHeader[]>(
      (headers) => codeApi.addCodeHeader(headers),
      config
    );

  /** upsert a collar */
  const useMutateCollar = (
    config: UseMutationOptions<IBulkUploadResults<Collar>, AxiosError, IUpsertPayload<Collar>>
  ): UseMutationResult<IBulkUploadResults<Collar>> =>
    useMutation<IBulkUploadResults<Collar>, AxiosError, IUpsertPayload<Collar>>(
      (collar) => collarApi.upsertCollar(collar),
      config
    );

  /** upsert an animal */
  const useMutateCritter = (
    config: UseMutationOptions<IBulkUploadResults<Animal>, AxiosError, IUpsertPayload<Animal>>
  ): UseMutationResult<IBulkUploadResults<Animal>> =>
    useMutation<IBulkUploadResults<Animal>, AxiosError, IUpsertPayload<Animal>>((critter) => critterApi.upsertCritter(critter), config);

  /** attach or remove a device from an animal */
  const useMutateLinkCollar = (
    config: UseMutationOptions<CollarHistory, AxiosError, ICollarLinkPayload>
  ): UseMutationResult =>
    useMutation<CollarHistory, AxiosError, ICollarLinkPayload>((link) => critterApi.linkCollar(link), config);

  /** upload a single .csv file to add or update codes/code headers, critters, or collars */
  const useMutateBulkCsv = <T>(
    config: UseMutationOptions<IBulkUploadResults<T>, AxiosError, FormData>
  ): UseMutationResult<IBulkUploadResults<T>, AxiosError> =>
    useMutation<IBulkUploadResults<T>, AxiosError, FormData>((form) => bulkApi.uploadCsv(form), config);

  /** upload one or more .keyx files to create new Vectronic devices */
  const useMutateBulkXml = (
    config: UseMutationOptions<IBulkUploadResults<any>, AxiosError, FormData>
  ): UseMutationResult<IBulkUploadResults<any>, AxiosError> =>
    useMutation<IBulkUploadResults<any>, AxiosError, FormData>((formData) => bulkApi.uploadFiles(formData), config);

  /** grant or remove permissions to a user to animals */
  const useMutateGrantCritterAccess = (
    config: UseMutationOptions<IBulkUploadResults<IGrantCritterAccessResults>, AxiosError, IUserCritterPermissionInput>
  ): UseMutationResult =>
    useMutation<IBulkUploadResults<IGrantCritterAccessResults>, AxiosError, IUserCritterPermissionInput>(
      (body) => userApi.grantCritterAccessToUser(body),
      config
    );

  /** delete a critter or device */
  const useDelete = (config: UseMutationOptions<boolean, AxiosError, IDeleteType>): UseMutationResult<boolean> =>
    useMutation<boolean, AxiosError, IDeleteType>((body) => critterApi.deleteType(body), config);

  /** save user defined animal groups */
  const useMutateUDF = (config: UseMutationOptions<IUDF[], AxiosError, IUDFInput[]>): UseMutationResult<IUDF[]> =>
    useMutation<IUDF[], AxiosError, IUDFInput[]>((body) => userApi.upsertUDF(body), config);

  return {
    // queries
    useAlert,
    useCodes,
    useCodeHeaders,
    useTracks,
    usePings,
    useCollarType,
    useAllCritters,
    useAssignedCritters,
    useUnassignedCritters,
    useCritterHistory,
    useCollarAssignmentHistory,
    useCollarHistory,
    useType,
    useUser,
    useUsers,
    useCritterAccess,
    useExport,
    useUDF,
    // mutations
    useMutateCodeHeader,
    useMutateBulkCsv,
    useMutateBulkXml,
    useMutateCollar,
    useMutateCritter,
    useMutateLinkCollar,
    useMutateGrantCritterAccess,
    useMutateUDF,
    useDelete
  };
};
