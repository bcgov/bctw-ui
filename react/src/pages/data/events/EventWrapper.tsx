import { IBulkUploadResults } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { ModalBaseProps } from 'components/component_interfaces';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { BCTWEvent, EventType } from 'types/events/event';
import MortalityEvent from 'types/events/mortality_event';
import { formatAxiosError } from 'utils/errors';
import CaptureEventForm from './CaptureEventForm';
import MortalityEventForm from './MortalityEventForm';
import ReleaseEventForm from './ReleaseEventForm';

type EventWrapperProps = ModalBaseProps & {
  event: BCTWEvent;
  eventType: EventType;
  onEventSaved?: () => void; // to notify alert that event was saved
};

/**
 * wraps all of the event pages.
 * handles saving
 */
export default function EventWrapper({ event, eventType, onEventSaved, open, handleClose }: EventWrapperProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const handleEventSaved = async (data: IBulkUploadResults<unknown>): Promise<void> => {
    // console.log('data returned from mortality alert context', data);
    const { errors, results } = data;
    if (errors.length) {
      responseDispatch({ severity: 'error', message: `${errors.map((e) => e.error)}` });
    } else if (results.length) {
      responseDispatch({ severity: 'success', message: 'mortality event saved!' });
      // expire the telemetry alert
      if (typeof onEventSaved === 'function') {
        onEventSaved();
      }
    }
  };

  const onError = (e: AxiosError) => {
    console.log('error saving event', formatAxiosError(e));
  };

  // setup save mutation
  const { mutateAsync: saveMortality } = bctwApi.useMutateMortalityEvent({ onSuccess: handleEventSaved });

  // performs metadata updates of collar/critter
  const handleSave = async (event: MortalityEvent): Promise<void> => {
    if (event) {
      await saveMortality(event);
    }
  };

  switch (eventType) {
    case 'release':
      return <ReleaseEventForm />;
    case 'capture':
      return <CaptureEventForm />;
    case 'mortality':
      return (
        <MortalityEventForm
          event={event as MortalityEvent}
          open={open}
          handleClose={handleClose}
          handleSave={handleSave}
        />
      );
    case 'unknown':
    default:
      return <></>
  }
}
