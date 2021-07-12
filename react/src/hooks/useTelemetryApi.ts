import { getBaseUrl } from 'api/api_helpers';
import { bulkApi as bulk_api } from 'api/bulk_api';
import { codeApi as code_api } from 'api/code_api';
import { collarApi as collar_api } from 'api/collar_api';
import { critterApi as critter_api } from 'api/critter_api';
import { eventApi as event_api } from 'api/event_api';
import { mapApi as map_api } from 'api/map_api';
import { IUserUpsertPayload, userApi as user_api } from 'api/user_api';
import { IGrantCritterAccessResults, permissionApi as permission_api } from 'api/permission_api';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useMemo } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQuery, UseQueryResult } from 'react-query';
import { Animal, eCritterFetchType } from 'types/animal';
import { ICode, ICodeHeader } from 'types/code';
import { Collar, eCollarAssignedStatus } from 'types/collar';
import { CollarHistory } from 'types/collar_history';
import { IKeyCloakSessionInfo, IUserCritterAccess, User, UserCritterAccess } from 'types/user';

import {
  IBulkUploadResults,
  ICollarLinkPayload,
  IDeleteType,
  IUpsertPayload,
} from 'api/api_interfaces';
import { TelemetryAlert } from 'types/alert';
import { BCTW, BCTWType } from 'types/common_types';
import { ExportQueryParams } from 'types/export';
import { eUDFType, IUDF, IUDFInput } from 'types/udf';
import { ITelemetryPoint, ITelemetryLine } from 'types/map';
import MortalityEvent from 'types/mortality_event';
import { eCritterPermission, IExecutePermissionRequest, IPermissionRequestInput, IUserCritterPermissionInput, PermissionRequest } from 'types/permission';

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

  const collarApi = collar_api({ api });
  const critterApi = critter_api({ api });
  const codeApi = code_api({ api });
  const bulkApi = bulk_api(api);
  const mapApi = map_api({ api });
  const userApi = user_api({ api });
  const eventApi = event_api({ api });
  const permissionApi = permission_api({ api});

  const defaultQueryOptions = { refetchOnWindowFocus: false };

  /**
   *
   */
  const useTracks = (start: string, end: string): UseQueryResult<ITelemetryLine[], AxiosError> => {
    return useQuery<ITelemetryLine[], AxiosError>(
      ['tracks', start, end],
      () => mapApi.getTracks(start, end),
      defaultQueryOptions
    );
  };

  const useUnassignedTracks = (start: string, end: string): UseQueryResult<ITelemetryLine[], AxiosError> => {
    return useQuery<ITelemetryLine[], AxiosError>(
      ['unassigned_tracks', start, end],
      () => mapApi.getTracks(start, end, true),
      {...defaultQueryOptions, refetchOnMount: false, }
    );
  };

  /**
   *
   */
  const usePings = (start: string, end: string): UseQueryResult<ITelemetryPoint[], AxiosError> => {
    return useQuery<ITelemetryPoint[], AxiosError>(
      ['pings', { start, end }],
      () => mapApi.getPings(start, end),
      defaultQueryOptions
    );
  };

  // the same as usePings, but doesn't auto fetch due to enabled: false setting
  const useUnassignedPings = (start: string, end: string): UseQueryResult<ITelemetryPoint[], AxiosError> => {
    return useQuery<ITelemetryPoint[], AxiosError>(
      ['unassigned_pings', { start, end}],
      () => mapApi.getPings(start, end, true),
      defaultQueryOptions 
    );
  }

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

  const critterOptions = { ...defaultQueryOptions, keepPreviousData: true };
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
   * @returns a list of critters representing the audit history of @param critterId
   */
  const useCritterHistory = (page: number, critterId: string): UseQueryResult<Animal[]> => {
    return useQuery<Animal[], AxiosError>(
      ['critter_history', critterId, page],
      () => critterApi.getCritterHistory(page, critterId),
      critterOptions
    );
  };

  const codeOptions = {...defaultQueryOptions, refetchOnMount: false};

  /**
   * @param codeHeader the code header name used to determine which codes to fetch
   * @param page not currently used
  */
  const useCodes = (page: number, codeHeader: string): UseQueryResult<ICode[], AxiosError> => {
    const props = { page, codeHeader };
    return useQuery<ICode[], AxiosError>(['codes', props], () => codeApi.getCodes(props), codeOptions);
  };

  /**
   * retrieves list of code headers, no parameters
  */
  const useCodeHeaders = (): UseQueryResult<ICodeHeader[], AxiosError> => {
    return useQuery<ICodeHeader[], AxiosError>('codeHeaders', () => codeApi.getCodeHeaders(), codeOptions);
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
   * @returns a keycloak information for the user
   */
  const useUserSessionInfo = (): UseQueryResult<IKeyCloakSessionInfo, AxiosError> => {
    return useQuery<IKeyCloakSessionInfo, AxiosError>('user-session', () => userApi.getSessionInfo(), defaultQueryOptions);
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
   * @param user who to retrieve critter access for 
   * @returns an array of @type {UserCritterAccess}
   * note: query keys are important! make sure to include params in the key
   * note: enabled prop can be set to false to delay the query
   */
  const useCritterAccess = (page: number, param: {user: User; filter?: eCritterPermission[]} /*, enabled = true*/): UseQueryResult<UserCritterAccess[], AxiosError> => {
    const { user, filter } = param;
    return useQuery<UserCritterAccess[], AxiosError>(
      ['critterAccess', page, user],
      () => permissionApi.getUserCritterAccess(page, user, filter), defaultQueryOptions
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
  const useType = <T extends BCTW>(type: BCTWType, id: string): UseQueryResult<T> => {
    return useQuery<T, AxiosError>(['getType', type, id], () => bulkApi.getType(type, id), {
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

  /** see permission_api documentation */
  const usePermissionRequests = (): UseQueryResult<PermissionRequest[], AxiosError> => {
    return useQuery<PermissionRequest[], AxiosError>(['getRequests'], () => permissionApi.getPermissionRequest(), defaultQueryOptions);
  }

  /** see permission_api documentation */
  const usePermissionHistory = (page: number): UseQueryResult<PermissionRequest[], AxiosError> => {
    return useQuery<PermissionRequest[], AxiosError>(['getRequestHistory', page], () => permissionApi.getPermissionHistory(page), defaultQueryOptions);
  }

  /**
   *
   * mutations - post/delete requests
   * 
   */

  /**
   * todo:
  */
  const useExport = (config: UseMutationOptions<string[], AxiosError, ExportQueryParams>): UseMutationResult<string[]> => {
    return useMutation<string[], AxiosError, ExportQueryParams>((body) => bulkApi.getExportData(body), config);
  };

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
      (body) => permissionApi.grantCritterAccessToUser(body),
      config
    );

  /** delete a critter or device */
  const useDelete = (config: UseMutationOptions<boolean, AxiosError, IDeleteType>): UseMutationResult<boolean> =>
    useMutation<boolean, AxiosError, IDeleteType>((body) => critterApi.deleteType(body), config);

  /** save user defined animal groups */
  const useMutateUDF = (config: UseMutationOptions<IUDF[], AxiosError, IUDFInput[]>): UseMutationResult<IUDF[]> =>
    useMutation<IUDF[], AxiosError, IUDFInput[]>((body) => userApi.upsertUDF(body), config);

  /** expire or snooze a user telemetry alert */
  const useMutateUserAlert = (config: UseMutationOptions<TelemetryAlert[], AxiosError, TelemetryAlert[]>): UseMutationResult<TelemetryAlert[]> =>
    useMutation<TelemetryAlert[], AxiosError, TelemetryAlert[]>((body) => userApi.updateAlert(body), config);
  
  /** POST a mortality event form */
  const useMutateMortalityEvent = (config: UseMutationOptions<IBulkUploadResults<unknown>, AxiosError, MortalityEvent>): UseMutationResult<IBulkUploadResults<unknown>> =>
    useMutation<IBulkUploadResults<unknown>, AxiosError, MortalityEvent>((body) => eventApi.saveMortalityEvent(body), config);
  
  /** add or update a user */
  const useMutateUser = (config: UseMutationOptions<User, AxiosError, IUserUpsertPayload>): UseMutationResult<User> =>
    useMutation<User, AxiosError, IUserUpsertPayload>((body) => userApi.addUser(body), config);
  
  /** see permission_api doc */ 
  const useMutateSubmitPermissionRequest = (config: UseMutationOptions<unknown, AxiosError, IPermissionRequestInput>): UseMutationResult<unknown> => 
    useMutation<unknown, AxiosError, IPermissionRequestInput>((body) => permissionApi.submitPermissionRequest(body), config);

  /** see permission_api doc */ 
  const useMutateTakeActionOnPermissionRequest = (config: UseMutationOptions<IUserCritterAccess, AxiosError, IExecutePermissionRequest>): UseMutationResult<IUserCritterAccess> => 
    useMutation<IUserCritterAccess, AxiosError, IExecutePermissionRequest>((body) => permissionApi.takeActionOnPermissionRequest(body), config);

  return {
    // queries
    useAlert,
    useCodes,
    useCodeHeaders,
    useTracks,
    useUnassignedTracks,
    usePings,
    useUnassignedPings,
    useCollarType,
    // useAllCritters,
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
    usePermissionRequests,
    usePermissionHistory,
    useUserSessionInfo,
    // mutations
    useMutateCodeHeader,
    useMutateBulkCsv,
    useMutateBulkXml,
    useMutateCollar,
    useMutateCritter,
    useMutateLinkCollar,
    useMutateGrantCritterAccess,
    useMutateUDF,
    useMutateUser,
    useDelete,
    useMutateUserAlert,
    useMutateMortalityEvent,
    useMutateSubmitPermissionRequest,
    useMutateTakeActionOnPermissionRequest,
  };
};
