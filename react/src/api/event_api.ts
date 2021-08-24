import { upsertCritterEndpoint, upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { createUrl } from 'api/api_helpers';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import MortalityEvent from 'types/mortality_event';

import { ApiProps, IBulkUploadResults } from './api_interfaces';

/**
 * API for handling workflow event like forms
 * todo: fixme: complete this
 */

export const eventApi = (props: ApiProps) => {
  const { api } = props;

  /**
    * when a mortality event form is saved, there are multipe objects that need to be updated.
    * a) the animal table
    * b) the collar table
    * c) if the device is marked as retrieved, the collar may need to be unlinked from the animal
    * d) if the user accessed the mortality event from a telemetry alert, the alert needs
       to be expired
  */
  const saveMortalityEvent = async (event: MortalityEvent): Promise<IBulkUploadResults<unknown>> => {
    const e = event.toJSON();
    // console.log(event, e)
    const device: Collar = e.getCollar;
    // console.log(JSON.stringify(device, null, 2))
    const animal: Animal = e.getCritter;
    // console.log(JSON.stringify(animal, null, 2))
    const isUnlinking: boolean = e.shouldUnattachDevice;
    const {data: dResults } = await api.post(createUrl({api: upsertDeviceEndpoint}), device);
    const {data: aResults } = await api.post(createUrl({api: upsertCritterEndpoint}), animal)
    const errors = [...dResults.errors, ...aResults.errors];
    const results = [...dResults.results, ...aResults.results];
    if (isUnlinking) {
      console.log(' todo: unlink collar assignment!')
    }
    return { errors, results }; 

    // const body: ICollarLinkPayload = {
    //   isLink: false,
    //   data: {
    //     critter_id: animal.critter_id,
    //     collar_id: device.collar_id,
    //     valid_to: getNow()
    //   }
    // }
    // const linkResults = await api.post(createUrl({ api: linkCollarEndpoint}), body);

  }

  return {
    saveMortalityEvent,
  }
}