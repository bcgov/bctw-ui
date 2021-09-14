/* eslint-disable no-console */
import { removeDeviceEndpoint, upsertCritterEndpoint, upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { createUrl } from 'api/api_helpers';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { EventType } from 'types/events/event';
import MortalityEvent from 'types/events/mortality_event';
import { formatAxiosError } from 'utils/errors';
import { ApiProps } from './api_interfaces';

/**
 * API for saving workflow events @type {EventType}
 */

export type WorkflowAPIResponse = true | AxiosError;

export const eventApi = (props: ApiProps) => {
  const { api } = props;

  /**
    * when a mortality event form is saved, there are multipe objects that need to be updated.
    * a) the animal table
    * b) the collar table
    * c) if the device is marked as retrieved, the device may need to be removed
    * fixme: bug: if a later api post fails...what happens to form???
  */
  const eventErr = (ev: EventType): string => `${ev} saving workflow:`;
  const saveMortalityEvent = async (event: MortalityEvent): Promise<WorkflowAPIResponse> => {

    if (event.shouldUnattachDevice ) {
      const attachment = event.getAttachment();
      const { assignment_id, attachment_end, data_life_end} = attachment;
      const url = createUrl({ api: removeDeviceEndpoint});
      try {
        const { data } = await api.post(url, {assignment_id, attachment_end: dayjs(attachment_end).toDate(), data_life_end: dayjs(data_life_end).toDate()});
        console.log('removed device successfully', data);
      } catch (err) {
        console.error(`${eventErr(event.event_type)} caught exception removing device', ${formatAxiosError(err)}`);
        return err;
      }
    }
    const critter = event.getAnimal();
    if (critter) {
      console.log(critter);
      const url = createUrl({ api: upsertCritterEndpoint});
      try {
        const { data } = await api.post(url, critter);
        console.log('saving animal results', data);
      } catch(err) {
        console.error(`${eventErr(event.event_type)} caught exception saving animal', ${formatAxiosError(err)}`);
        return err;
      }
    }
    const device = event.getDevice();
    if (device) {
      const url = createUrl({api: upsertDeviceEndpoint});
      try {
        const { data } = await api.post(url, device);
        console.log('saving device results', data);
      } catch (err) {
        console.error(`${eventErr(event.event_type)} caught exception saving device', ${formatAxiosError(err)}`);
        return err;
      }
    }
    return true;
  }

  return {
    saveMortalityEvent,
  }
}