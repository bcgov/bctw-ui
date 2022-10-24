import { getBaseUrl } from 'api/api_helpers';
import { bulkApi as bulk_api } from 'api/bulk_api';
import { codeApi as code_api } from 'api/code_api';
import { collarApi as collar_api } from 'api/collar_api';
import { critterApi as critter_api } from 'api/critter_api';
import { eventApi as event_api, WorkflowAPIResponse } from 'api/event_api';
import { onboardingApi as onboarding_api } from 'api/onboarding_api';
import { mapApi as map_api } from 'api/map_api';
import { attachmentApi as attachment_api } from 'api/attachment_api';
import { userApi as user_api } from 'api/user_api';
import { IGrantCritterAccessResults, permissionApi as permission_api } from 'api/permission_api';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useMemo } from 'react';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from 'react-query';
import { Animal, AttachedAnimal, eCritterFetchType } from 'types/animal';
import { ICode, ICodeHeader } from 'types/code';
import { AttachedCollar, Collar, IVectronicUpsert } from 'types/collar';
import { CollarHistory, AttachDeviceInput, RemoveDeviceInput } from 'types/collar_history';
import { IKeyCloakSessionInfo, User } from 'types/user';

import { IBulkUploadResults, IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import { MortalityAlert, TelemetryAlert } from 'types/alert';
import { BCTWType } from 'types/common_types';
import { ExportQueryParams } from 'types/export';
import { eUDFType, IUDF, UDF } from 'types/udf';
import { ITelemetryPoint, ITelemetryLine } from 'types/map';
import {
  eCritterPermission,
  IExecutePermissionRequest,
  IPermissionRequestInput,
  IUserCritterPermissionInput,
  PermissionRequest
} from 'types/permission';
import { ChangeDataLifeInput } from 'types/data_life';
import { BCTWWorkflow } from 'types/events/event';
import { IOnboardUser, HandleOnboardInput, OnboardUser, OnboardUserRequest } from 'types/onboarding';
import { IUserCritterAccess, UserCritterAccess } from 'types/animal_access';
import { parseArgs } from 'utils/common_helpers';
import { FetchTelemetryInput, ResponseTelemetry } from 'types/events/vendor';
import { useSpecies } from 'contexts/SpeciesContext';

/**
 * Returns an instance of axios with baseURL set.
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

type QueryEnabled = Pick<UseQueryOptions, 'enabled'>;

/**
 * Returns a set of supported api methods.
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
  const permissionApi = permission_api({ api });
  const attachmentApi = attachment_api({ api });
  const onboardApi = onboarding_api({ api });

  const defaultQueryOptions: Pick<UseQueryOptions, 'refetchOnWindowFocus'> = { refetchOnWindowFocus: false };

  /**
   *
   */
  const useEstimate = (start: string, end: string): UseQueryResult<any, AxiosError> => {
    return useQuery<any, AxiosError>(['estimate', start, end], () => mapApi.getEstimate(start, end), {
      ...defaultQueryOptions,
      retry: false
    });
  };

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
      { ...defaultQueryOptions, refetchOnMount: false }
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
      ['unassigned_pings', { start, end }],
      () => mapApi.getPings(start, end, true),
      defaultQueryOptions
    );
  };

  /**
   * retrieves devices that are attached to an animal
   */
  const useAttachedDevices = (page: number, ...args: unknown[]): UseQueryResult<AttachedCollar[], AxiosError> => {
    const search = parseArgs(args);
    return useQuery<AttachedCollar[], AxiosError>(
      ['collars_attached', page, search.map((s) => s?.term).join()],
      () => collarApi.getAssignedCollars(page, search),
      critterOptions
    );
  };

  /**
   * retrieves devices that are not currently attached to an animal
   */
  const useUnattachedDevices = (page: number, ...args: unknown[]): UseQueryResult<Collar[], AxiosError> => {
    const search = parseArgs(args);
    return useQuery<Collar[], AxiosError>(
      ['collars_unattached', page, search.map((s) => s?.term).join()],
      () => collarApi.getAvailableCollars(page, search),
      critterOptions
    );
  };

  /**
   * retrieves a combined list of attached/unattached devices
   */
  const useAllDevices = (page: number, ...args: unknown[]): UseQueryResult<Collar[], AxiosError> => {
    const search = parseArgs(args);
    return useQuery<Collar[], AxiosError>(
      ['all_devices', page, search.map((s) => s?.term).join()],
      () => collarApi.getAllDevices(page, search),
      critterOptions
    );
  };

  /**
   * retrieves a combined list of attached/unattached devices with devices that have no collar_id.
   */
  const useAllDevicesWithUnassignedCollarIds = (
    page: number,
    ...args: unknown[]
  ): UseQueryResult<Collar[], AxiosError> => {
    const search = parseArgs(args);
    return useQuery<Collar[], AxiosError>(
      ['all_devices_with_unassigned', page, search.map((s) => s?.term).join()],
      () => collarApi.getAllDevicesWithUnassignedCollarIds(page, search),
      critterOptions
    );
  };

  const critterOptions = { ...defaultQueryOptions, keepPreviousData: true };
  /**
   * retrieves critters that have a collar assigned
   */
  const useAssignedCritters = (
    page: number,
    config?: Record<string, unknown>,
    ...args: unknown[]
  ): UseQueryResult<Animal[] | AttachedAnimal[]> => {
    const search = parseArgs(args);
    return useQuery<Animal[] | AttachedAnimal[], AxiosError>(
      ['critters_assigned', page, search.map((s) => s?.term).join()],
      () => critterApi.getCritters(page, eCritterFetchType.assigned, search),
      { ...critterOptions, ...config }
    );
  };

  /**
   * retrieves critters not assigned to a collar
   */
  const useUnassignedCritters = (
    page: number,
    config?: Record<string, unknown>,
    ...args: unknown[]
  ): UseQueryResult<Animal[] | AttachedAnimal[]> => {
    const search = parseArgs(args);
    return useQuery<Animal[] | AttachedAnimal[], AxiosError>(
      ['critters_unassigned', page, search.map((s) => s?.term).join()],
      () => critterApi.getCritters(page, eCritterFetchType.unassigned, search),
      { ...critterOptions, ...config }
    );
  };

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

  // minimize code refetching
  const codeOptions = { ...defaultQueryOptions, refetchOnMount: false };

  /**
   * @param codeHeader the code header name used to determine which codes to fetch
   * @param page not currently used
   */
  const useCodes = <T>(
    page: number,
    codeHeader: string,
    species?: string | null,
    options?: T
  ): UseQueryResult<ICode[], AxiosError> => {
    const props = { page, codeHeader, species };
    return useQuery<ICode[], AxiosError>(['codes', props], () => codeApi.getCodes(props), {
      ...codeOptions,
      ...options
    });
  };
  /**
   * @param codeName the code name used to determine which desc to fetch
   */
  const useCodeDesc = (codeName: string): UseQueryResult<string, AxiosError> => {
    return useQuery<string, AxiosError>(['codeName', codeName], () => codeApi.getCodeLongDesc(codeName), codeOptions);
  };
  /**
   * retrieves list of code headers, no parameters
   */
  const useCodeHeaders = (): UseQueryResult<ICodeHeader[], AxiosError> => {
    return useQuery<ICodeHeader[], AxiosError>('codeHeaders', () => codeApi.getCodeHeaders(), codeOptions);
  };

  /**
   * given @param critter_id, retrieve it's device attachment history
   */
  const useCollarAssignmentHistory = (
    page: number,
    critterId: string,
    config: Record<string, unknown>
  ): UseQueryResult<CollarHistory[]> => {
    return useQuery<CollarHistory[], AxiosError>(
      ['collarAssignmentHistory', critterId],
      () => attachmentApi.getCollarAssignmentHistory(critterId),
      config
    );
  };

  /**
   * @returns a list of collars representing the audit history of @param collarId
   */
  const useCollarHistory = (page: number, collarId: string, config?: Record<string, unknown>): UseQueryResult => {
    return useQuery<Collar[], AxiosError>(
      ['collarHistory', collarId],
      () => collarApi.getCollarHistory(collarId),
      config
    );
  };

  /**
   * @returns a user object, no parameters because it uses the keycloak object to pass idir
   */
  const useUser = (options = {}): UseQueryResult<User, AxiosError> => {
    return useQuery<User, AxiosError>('user', () => userApi.getUser(), options);
  };

  /**
   * @returns a keycloak information for the user
   */
  const useUserSessionInfo = (): UseQueryResult<IKeyCloakSessionInfo, AxiosError> => {
    return useQuery<IKeyCloakSessionInfo, AxiosError>(
      'user-session',
      () => userApi.getSessionInfo(),
      defaultQueryOptions
    );
  };

  /**
   * requires admin role
   * @returns a list of all users
   */
  const useUsers = (page: number): UseQueryResult =>
    useQuery<User[], AxiosError>('all_users', () => userApi.getUsers(page), defaultQueryOptions);

  /**
   * @param user who to retrieve critter access for
   * @returns an array of @type {UserCritterAccess}
   * note: query keys are important! make sure to include params in the key
   * note: enabled prop can be set to false to delay the query
   */
  const useCritterAccess = (
    page: number,
    param: { user: User; filter?: eCritterPermission[] },
    ...args: unknown[]
  ): UseQueryResult<UserCritterAccess[], AxiosError> => {
    const { user, filter } = param;
    const queryKeys = ['critterAccess', page, user];
    // const search = parseArgs(args);
    // if (search) {
    //   queryProps.push(search.term);
    // }

    // note: what to consider changed?
    // term if its the search string, keys if its the filter type
    return useQuery<UserCritterAccess[], AxiosError>(
      queryKeys,
      () => permissionApi.getUserCritterAccess(page, user, filter /*search*/),
      defaultQueryOptions
    );
  };

  /**
   * optionally provide the @param enabled to disable this query
   */
  const useAlert = (options?: QueryEnabled): UseQueryResult<MortalityAlert[]> => {
    return useQuery<MortalityAlert[], AxiosError>(['userAlert'], () => userApi.getUserAlerts(), {
      ...defaultQueryOptions,
      ...options
    });
  };

  // default getter for individual animals or collars
  const useType = <T>(type: BCTWType, id: string, options?: QueryEnabled): UseQueryResult<T> => {
    return useQuery<T, AxiosError>(['getType', type, id], () => bulkApi.getType(type, id), {
      ...defaultQueryOptions,
      ...options
    });
  };

  /** retrieve UDFS of @param type (@type {eUDFType})  */
  const useUDF = (type: eUDFType): UseQueryResult<UDF[], AxiosError> => {
    return useQuery<UDF[], AxiosError>(['getUDF', type], () => userApi.getUDF(type), defaultQueryOptions);
  };

  /** see permission_api documentation */
  const usePermissionRequests = (): UseQueryResult<PermissionRequest[], AxiosError> => {
    return useQuery<PermissionRequest[], AxiosError>(
      ['getRequests'],
      () => permissionApi.getPermissionRequest(),
      defaultQueryOptions
    );
  };

  /** see permission_api documentation */
  const usePermissionHistory = (page: number): UseQueryResult<PermissionRequest[], AxiosError> => {
    return useQuery<PermissionRequest[], AxiosError>(
      ['getRequestHistory', page],
      () => permissionApi.getPermissionHistory(page),
      defaultQueryOptions
    );
  };

  /** get onboarding status for a non-existing BCTW user */
  const useOnboardStatus = (): UseQueryResult<OnboardUser, AxiosError> => {
    return useQuery<OnboardUser, AxiosError>(
      ['getOnboardStatus'],
      () => onboardApi.getOnboardStatus(),
      defaultQueryOptions
    );
  };

  /** get onboard requests  */
  const useOnboardRequests = (page: number): UseQueryResult<IOnboardUser[], AxiosError> => {
    return useQuery<IOnboardUser[], AxiosError>(
      ['getOnboardRequests', page],
      () => onboardApi.getOnboardingRequests(),
      defaultQueryOptions
    );
  };

  /** fetch json to be exported */
  const useExport = (
    config: UseMutationOptions<string[], AxiosError, ExportQueryParams>
  ): UseMutationResult<string[]> => {
    return useMutation<string[], AxiosError, ExportQueryParams>((body) => bulkApi.getExportData(body), config);
  };

  /**
   *
   * mutations - post/delete requests
   *
   */

  /** save a code header */
  const useSaveCodeHeader = (
    config: UseMutationOptions<IBulkUploadResults<ICodeHeader>, AxiosError, ICodeHeader[]>
  ): UseMutationResult<IBulkUploadResults<ICodeHeader>> =>
    useMutation<IBulkUploadResults<ICodeHeader>, AxiosError, ICodeHeader[]>(
      (headers) => codeApi.addCodeHeader(headers),
      config
    );

  /** upsert a collar */
  const useSaveDevice = (
    config: UseMutationOptions<IBulkUploadResults<Collar>, AxiosError, IUpsertPayload<Collar>>
  ): UseMutationResult<IBulkUploadResults<Collar>> =>
    useMutation<IBulkUploadResults<Collar>, AxiosError, IUpsertPayload<Collar>>(
      (collar) => collarApi.upsertCollar(collar),
      config
    );

  /** upsert an animal */
  const useSaveAnimal = (
    config: UseMutationOptions<IBulkUploadResults<Animal>, AxiosError, IUpsertPayload<Animal>>
  ): UseMutationResult<IBulkUploadResults<Animal>> =>
    useMutation<IBulkUploadResults<Animal>, AxiosError, IUpsertPayload<Animal>>(
      (critter) => critterApi.upsertCritter(critter),
      config
    );

  /** attaches a device from an animal */
  const useAttachDevice = (
    config: UseMutationOptions<CollarHistory, AxiosError, AttachDeviceInput>
  ): UseMutationResult =>
    useMutation<CollarHistory, AxiosError, AttachDeviceInput>((link) => attachmentApi.attachDevice(link), config);

  /** removes a device from an animal */
  const useRemoveDevice = (
    config: UseMutationOptions<CollarHistory, AxiosError, RemoveDeviceInput>
  ): UseMutationResult =>
    useMutation<CollarHistory, AxiosError, RemoveDeviceInput>((link) => attachmentApi.removeDevice(link), config);

  /** updates the data life of an animal/device attachment */
  const useEditDataLife = (
    config: UseMutationOptions<CollarHistory, AxiosError, ChangeDataLifeInput>
  ): UseMutationResult =>
    useMutation<CollarHistory, AxiosError, ChangeDataLifeInput>(
      (dl) => attachmentApi.updateAttachmentDataLife(dl),
      config
    );

  /** upload a single .csv file to add or update critters/devices */
  const useUploadCSV = <T>(
    config: UseMutationOptions<IBulkUploadResults<T>, AxiosError, FormData>
  ): UseMutationResult<IBulkUploadResults<T>, AxiosError> =>
    useMutation<IBulkUploadResults<T>, AxiosError, FormData>((form) => bulkApi.uploadCsv(form), config);

  /** upload one or more .keyx files to create new Vectronic devices */
  const useUploadXML = (
    config: UseMutationOptions<IBulkUploadResults<IVectronicUpsert>, AxiosError, FormData>
  ): UseMutationResult<IBulkUploadResults<IVectronicUpsert>, AxiosError> =>
    useMutation<IBulkUploadResults<IVectronicUpsert>, AxiosError, FormData>(
      (formData) => bulkApi.uploadFiles(formData),
      config
    );

  /** grant or remove permissions to a user to animals */
  const useGrantCritterAccess = (
    config: UseMutationOptions<IBulkUploadResults<IGrantCritterAccessResults>, AxiosError, IUserCritterPermissionInput>
  ): UseMutationResult =>
    useMutation<IBulkUploadResults<IGrantCritterAccessResults>, AxiosError, IUserCritterPermissionInput>(
      (body) => permissionApi.grantCritterAccessToUser(body),
      config
    );

  /** delete a critter or device */
  const useDelete = (config: UseMutationOptions<boolean, AxiosError, IDeleteType>): UseMutationResult<boolean> =>
    useMutation<boolean, AxiosError, IDeleteType>((body) => bulkApi.deleteType(body), config);

  /** save user defined animal groups */
  const useSaveUDF = (config: UseMutationOptions<IUDF[], AxiosError, IUDF[]>): UseMutationResult<IUDF[]> =>
    useMutation<IUDF[], AxiosError, IUDF[]>((body) => userApi.upsertUDF(body), config);

  /** expire or snooze a user telemetry alert */
  const useSaveUserAlert = (
    config: UseMutationOptions<TelemetryAlert[], AxiosError, TelemetryAlert[]>
  ): UseMutationResult<TelemetryAlert[]> =>
    useMutation<TelemetryAlert[], AxiosError, TelemetryAlert[]>((body) => userApi.updateAlert(body), config);

  /** POST a mortality event form */
  const useSaveWorkflowEvent = <T extends BCTWWorkflow<T>>(
    config: UseMutationOptions<WorkflowAPIResponse, AxiosError, T>
  ): UseMutationResult<WorkflowAPIResponse, AxiosError, T> =>
    useMutation<WorkflowAPIResponse, AxiosError, T>((body) => eventApi.saveEvent(body), config);

  /** add or update a user */
  const useSaveUser = (config: UseMutationOptions<User, AxiosError, User>): UseMutationResult<User, AxiosError> =>
    useMutation<User, AxiosError, User>((body) => userApi.addUser(body), config);

  /** add a new user that hasn't been onboarded */
  const useSubmitOnboardingRequest = (
    config: UseMutationOptions<IOnboardUser, AxiosError, OnboardUserRequest>
  ): UseMutationResult<IOnboardUser, AxiosError> =>
    useMutation<IOnboardUser, AxiosError, OnboardUserRequest>(
      (body) => onboardApi.submitOnboardingRequest(body),
      config
    );

  /** grants or denies an onboarding request */
  const useHandleOnboardingRequest = (
    config: UseMutationOptions<boolean, AxiosError, HandleOnboardInput>
  ): UseMutationResult<boolean, AxiosError> =>
    useMutation<boolean, AxiosError, HandleOnboardInput>((body) => onboardApi.handleOnboardingRequest(body), config);

  /** see permission_api doc */
  const useSubmitPermissionRequest = (
    config: UseMutationOptions<unknown, AxiosError, IPermissionRequestInput>
  ): UseMutationResult<unknown> =>
    useMutation<unknown, AxiosError, IPermissionRequestInput>(
      (body) => permissionApi.submitPermissionRequest(body),
      config
    );

  /** see permission_api doc */
  const useTakeActionOnPermissionRequest = (
    config: UseMutationOptions<IExecutePermissionRequest[], AxiosError, IExecutePermissionRequest[]>
  ): UseMutationResult<IExecutePermissionRequest[]> =>
    useMutation<IExecutePermissionRequest[], AxiosError, IExecutePermissionRequest[]>(
      (body) => permissionApi.takeActionOnPermissionRequest(body),
      config
    );

  /*
      const useTakeActionOnPermissionRequest = (
    config: UseMutationOptions<IUserCritterAccess, AxiosError, IExecutePermissionRequest>
  ): UseMutationResult<IUserCritterAccess> =>
    useMutation<IUserCritterAccess, AxiosError, IExecutePermissionRequest>(
      (body) => permissionApi.takeActionOnPermissionRequest(body),
      config
    );*/

  /**
   * although this not a post request, use it like a mutation so it can be triggered manually
   * see user api documentation
   */
  const useTestNotifications = (): UseMutationResult<void> => {
    return useMutation<void, AxiosError>((body) => userApi.testUserAlertNotifications(body));
  };

  /** */
  const useTriggerVendorTelemetry = (
    config: UseMutationOptions<ResponseTelemetry[], AxiosError, FetchTelemetryInput[]>
  ): UseMutationResult<ResponseTelemetry[], AxiosError> =>
    useMutation<ResponseTelemetry[], AxiosError, FetchTelemetryInput[]>(
      (body) => collarApi.triggerVendorTelemetryUpdate(body),
      config
    );

  return {
    // queries
    useAlert,
    useCodes,
    useCodeDesc,
    useCodeHeaders,
    useEstimate,
    useTracks,
    useUnassignedTracks,
    usePings,
    useUnassignedPings,
    useAllDevices,
    useAttachedDevices,
    useUnattachedDevices,
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
    useOnboardRequests,
    useOnboardStatus,
    useTestNotifications,
    useAllDevicesWithUnassignedCollarIds,
    // mutations
    useSaveCodeHeader,
    useUploadCSV,
    useUploadXML,
    useSaveDevice,
    useSaveAnimal,
    useAttachDevice,
    useRemoveDevice,
    useEditDataLife,
    useGrantCritterAccess,
    useSaveUDF,
    useSaveUser,
    useDelete,
    useSaveUserAlert,
    useSaveWorkflowEvent,
    useSubmitPermissionRequest,
    useTakeActionOnPermissionRequest,
    useSubmitOnboardingRequest,
    useHandleOnboardingRequest,
    useTriggerVendorTelemetry
  };
};
