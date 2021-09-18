/* eslint-disable no-console */
import { removeDeviceEndpoint, upsertCritterEndpoint, upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { createUrl } from 'api/api_helpers';
import { AxiosError } from 'axios';
import { BCTWWorkflow, WorkflowType, OptionalAnimal, OptionalDevice } from 'types/events/event';
import MortalityEvent from 'types/events/mortality_event';
import { formatAxiosError } from 'utils/errors';
import { IBulkUploadResults, ApiProps } from './api_interfaces';

/**
 * API for saving workflow events @type {EventType}
 */

export type WorkflowAPIResponse = true | AxiosError;

export const eventApi = (props: ApiProps) => {
  const { api } = props;

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
    console.log(critter);
    const url = createUrl({ api: upsertCritterEndpoint });
    try {
      const { data } = await api.post(url, critter);
      console.log('saving animal results', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`${eventErr(type)} error saving animal', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const _saveDevice = async (device: OptionalDevice, type: WorkflowType): Promise<WorkflowAPIResponse> => {
    console.log(device);
    const url = createUrl({ api: upsertDeviceEndpoint });
    try {
      const { data } = await api.post(url, device);
      console.log('saving device results', data);
      return _handleBulkResults(data);
    } catch (err) {
      console.error(`${eventErr(type)} error saving device', ${formatAxiosError(err)}`);
      return err;
    }
  };

  const saveEvent = async <T extends BCTWWorkflow<T>>(event: T): Promise<true | WorkflowAPIResponse> => {
    if (event.getDataLife) {
      // todo:
      console.error('not implemented');
    }
    if (event instanceof MortalityEvent && event.shouldUnattachDevice) {
      const attachment = event.getAttachment();
      const url = createUrl({ api: removeDeviceEndpoint });
      try {
        const { data } = await api.post(url, attachment);
        console.log('removed device successfully', data);
      } catch (err) {
        console.error(`${eventErr(event.event_type)} error removing device', ${formatAxiosError(err)}`);
        return err;
      }
    }

    // todo: check each event implements function

    const critter = event.getAnimal();
    if (critter) {
      const s = await _saveAnimal(critter, event.event_type);
      if (typeof s !== 'boolean') {
        return s;
      }
    }

    const device = event.getDevice();
    if (device) {
      const s = _saveDevice(device, event.event_type);
      if (typeof s !== 'boolean') {
        return s;
      }
    }
    return true;
  };

  return { saveEvent };
};
