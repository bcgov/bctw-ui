/* eslint-disable no-console */
import {
  attachDeviceEndpoint,
  removeDeviceEndpoint,
  updateDatalifeEndpoint,
  upsertCritterEndpoint,
  upsertDeviceEndpoint
} from 'api/api_endpoint_urls';
import { createUrl, postJSON } from 'api/api_helpers';
import { AxiosError } from 'axios';
import { CbRouters, CbRoutes } from 'critterbase/routes';
import { useQueryClient } from 'react-query';
import { RemoveDeviceInput } from 'types/collar_history';
import { ChangeDataLifeInput } from 'types/data_life';
import { CaptureEvent2 } from 'types/events/capture_event';
import { CbPayload, IEvent, IWorkflow, OptionalAnimal, OptionalDevice, WorkflowType } from 'types/events/event';
import MortalityEvent from 'types/events/mortality_event';
import { formatAxiosError } from 'utils/errors';
import { API, ApiProps, IBulkUploadResults } from './api_interfaces';

/**
 * API for saving workflow events @type {EventType}
 */

export type WorkflowAPIResponse = true | AxiosError;

export const eventApi = (props: ApiProps): API => {
  const { api } = props;
  const queryClient = useQueryClient();

  // since saving an event can affect many queries, invalidate everything
  const invalidate = (): void => {
    queryClient.invalidateQueries();
  };

  /**
   * when an event form is saved, there are potentiall multiple post requests that need to be handled
   * if the device is marked as retrieved_ind, the device may need to be removed
   * the animal
   * the collar
   * fixme: if a later api post fails...how to handle form?
   */
  const eventErr = (ev: WorkflowType): string => `${ev} saving workflow:`;

  const _handleBulkResults = (data: IBulkUploadResults<unknown>): WorkflowAPIResponse => {
    const { errors } = data;
    if (errors?.length) {
      return { message: errors[0].error, isAxiosError: true } as AxiosError;
    }
    return true;
  };

  const _saveAnimal = async (critter: OptionalAnimal, type: WorkflowType): Promise<WorkflowAPIResponse> => {
    // console.log('workflow event animal', critter);
    // return true;
    try {
      const { data } = await postJSON(api, createUrl({ api: upsertCritterEndpoint }), critter);
      console.log('animal results', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`${eventErr(type)} error saving animal', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _saveDevice = async (device: OptionalDevice, type: WorkflowType): Promise<WorkflowAPIResponse> => {
    // console.log('workflow event device', device);
    // return true;
    try {
      const { data } = await postJSON(api, createUrl({ api: upsertDeviceEndpoint }), device);
      console.log('saving device results', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`${eventErr(type)} error saving device', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _addOrRemoveDevice = async (attachment: RemoveDeviceInput, isAdding: boolean): Promise<WorkflowAPIResponse> => {
    // console.log('workflow event add or attach event', attachment)
    // return true;
    try {
      const { data } = await postJSON(
        api,
        createUrl({ api: isAdding ? attachDeviceEndpoint : removeDeviceEndpoint }),
        attachment
      );
      console.log('device add/remove status', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`error adding/removing device', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _updateDataLife = async (dli: ChangeDataLifeInput): Promise<WorkflowAPIResponse> => {
    // console.log('workflow event update data life', dli);
    // return;
    try {
      const { data } = await postJSON(api, createUrl({ api: updateDatalifeEndpoint }), dli);
      console.log('update data life response', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`error updating data life', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _saveCbCapture = async (payload: CbPayload<CaptureEvent2>): Promise<WorkflowAPIResponse> => {
    try {
      const url = createUrl({ api: `${CbRouters.captures}/create` });
      const { data } = await api.post(url, payload);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`error creating critterbase capture & release event ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _saveCbMortality = async (payload: CbPayload<MortalityEvent>): Promise<WorkflowAPIResponse> => {
    try {
      const cod_url = createUrl({ api: `${CbRoutes.cod}` });
      const { data: cods } = await api.get(cod_url);
      const predation_id = cods.find((a) => a.cod_category === 'Predation')?.cod_id;
      if (payload.proximate_cause_of_death_id !== predation_id) {
        delete payload.proximate_predated_by_taxon_id;
      }
      if (payload.ultimate_cause_of_death_id !== predation_id) {
        delete payload.ultimate_predated_by_taxon_id;
      }
      const capture_url = createUrl({ api: `${CbRouters.mortality}/create` });
      const { data } = await api.post(capture_url, payload);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`error creating critterbase mortality event ${formatAxiosError(err)}`);
      return err;
    }
  };

  const saveEvent = async <T extends IEvent>(event: IWorkflow<T>): Promise<true | WorkflowAPIResponse> => {
    console.log(event)
    if (event.event_type === 'capture') {
      const c = await _saveCbCapture(event.critterbasePayload);
      if (typeof c !== 'boolean') {
        return c;
      }
    }
    if (event.event_type === 'mortality') {
      const m = await _saveCbMortality(event.critterbasePayload);
      if (typeof m !== 'boolean') {
        return m;
      }
    }
    // capture events can change the data life start
    if (typeof event.getDataLife === 'function') {
      const dli = event.getDataLife();
      const s = await _updateDataLife(dli);
      if (typeof s !== 'boolean') {
        return s;
      }
    }
    //
    if (typeof event.getAttachment === 'function' && event.shouldUnattachDevice) {
      const attachment = event.getAttachment();
      const s = await _addOrRemoveDevice(attachment as RemoveDeviceInput, false);
      if (typeof s !== 'boolean') {
        return s;
      }
    }
    //
    if (typeof event.getAnimal === 'function' && event.shouldSaveAnimal) {
      const critter = event.getAnimal();
      if (critter) {
        const s = await _saveAnimal(critter, event.event_type);
        if (typeof s !== 'boolean') {
          return s;
        }
      }
    }
    //
    if (typeof event.getDevice === 'function' && event.shouldSaveDevice) {
      const device = event.getDevice();
      if (device) {
        const s = await _saveDevice(device, event.event_type);
        if (typeof s !== 'boolean') {
          return s;
        }
      }
    }
    invalidate();
    return true;
  };

  return { saveEvent };
};
