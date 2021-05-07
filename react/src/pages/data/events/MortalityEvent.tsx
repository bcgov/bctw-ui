import { ModalBaseProps } from 'components/component_interfaces';
import Modal from 'components/modal/Modal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { EventBaseProps, generateLocationEventProps, LocationEventType } from 'types/event';
import EditModal from '../common/EditModal';


type MortEventProps = ModalBaseProps & EventBaseProps

/* mortality event
  2. Deactivated
  3. Device Deployment Status
  4. Device Retrieval Date
  5. Device Retrieved 
  6. Device Status  
  7. Mortality Date
  8. Mortality Lat/ Long  (user chooses either lat/long or UTM, do not allow both to be entered)
  9. Mortality UTM Zone/ Easting /Northing (user chooses either lat/long or UTM, do not allow both to be entered)
*/

export default function MortalityEvent({critter_id, open, handleClose}: MortEventProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  // const { data: critter, error: critterError, status: critterStatus } = bctwApi.useType<Animal>('animal', critter_id);
  const { data: device, error: deviceError, status: deviceStatus } = bctwApi.useType<Collar>('device', critter_id);

  if (deviceStatus !== 'success') {
    return <div>oh noes...</div>
  }
  return (
    <div></div>
  )
}
