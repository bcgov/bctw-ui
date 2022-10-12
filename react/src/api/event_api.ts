/* eslint-disable no-console */
import { attachDeviceEndpoint, removeDeviceEndpoint, updateDatalifeEndpoint, upsertCritterEndpoint, upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { createUrl, postJSON } from 'api/api_helpers';
import { AxiosError } from 'axios';
import { RemoveDeviceInput } from 'types/collar_history';
import { ChangeDataLifeInput } from 'types/data_life';
import { BCTWWorkflow, WorkflowType, OptionalAnimal, OptionalDevice } from 'types/events/event';
import { formatAxiosError } from 'utils/errors';
import { API, IBulkUploadResults, ApiProps } from './api_interfaces';
import { useQueryClient } from 'react-query';

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
  }

  /**
   * when an event form is saved, there are potentiall multiple post requests that need to be handled
   * if the device is marked as retrieved, the device may need to be removed
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
    try {
      const { data } = await postJSON(api, createUrl({ api: upsertCritterEndpoint }), critter);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`${eventErr(type)} error saving animal', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _saveDevice = async (device: OptionalDevice, type: WorkflowType): Promise<WorkflowAPIResponse> => {
    try {
      const { data } = await postJSON(api, createUrl({ api: upsertDeviceEndpoint }), device);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`${eventErr(type)} error saving device', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _addOrRemoveDevice = async (attachment: RemoveDeviceInput, isAdding: boolean): Promise<WorkflowAPIResponse> => {
    try {
      const { data } = await postJSON(api, createUrl({ api: isAdding ? attachDeviceEndpoint : removeDeviceEndpoint }), attachment);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`error adding/removing device', ${formatAxiosError(err)}`);
      return err;
    }
  }

  const _updateDataLife = async(dli: ChangeDataLifeInput): Promise<WorkflowAPIResponse> => {
    try {
      const { data } = await postJSON(api, createUrl({ api: updateDatalifeEndpoint}), dli);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`error updating data life', ${formatAxiosError(err)}`);
      return err;
    }
  }

  const saveEvent = async <T>(event: BCTWWorkflow<T>): Promise<true | WorkflowAPIResponse> => {
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
        const s = _saveDevice(device, event.event_type);
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
