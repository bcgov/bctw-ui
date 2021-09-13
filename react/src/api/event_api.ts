import { removeDeviceEndpoint, upsertCritterEndpoint, upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { createUrl } from 'api/api_helpers';
import MortalityEvent from 'types/events/mortality_event';
import { ApiProps } from './api_interfaces';

/**
 * API for saving workflow events @type {EventType}
 */

export const eventApi = (props: ApiProps) => {
  const { api } = props;

  /**
    * when a mortality event form is saved, there are multipe objects that need to be updated.
    * a) the animal table
    * b) the collar table
    * c) if the device is marked as retrieved, the device may need to be removed
  */
  const saveMortalityEvent = async (event: MortalityEvent): Promise<void> => {
    if (event.shouldUnattachDevice ) {
      // console.log(' atttempting to remove device')
      const attachment = event.getAttachment();
      const url = createUrl({ api: removeDeviceEndpoint});
      const { data } = await api.post(url, attachment);
      console.log('remove device results', data);
    }
    const critter = event.getAnimal();
    if (critter) {
      const url = createUrl({ api: upsertCritterEndpoint});
      const { data } = await api.post(url, critter);
      console.log('saving animal results', data);
    }
    const device = event.getDevice();
    if (device) {
      const url = createUrl({api: upsertDeviceEndpoint});
      const { data } = await api.post(url, device);
      console.log('saving device results', data);
    }
    // console.log(attachment, critter, device);
  }

  return {
    saveMortalityEvent,
  }
}