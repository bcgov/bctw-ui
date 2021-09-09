import { IBulkUploadResults } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { ModalBaseProps } from 'components/component_interfaces';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import ChangeContext from 'contexts/InputChangeContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { BCTWEvent, EventType } from 'types/events/event';
import { formatAxiosError } from 'utils/errors';
import EditModal from '../common/EditModal';
import { EditHeader } from '../common/EditModalComponents';
import CaptureEventForm from './CaptureEventForm';
import MortalityEventForm from './MortalityEventForm';
import ReleaseEventForm from './ReleaseEventForm';

type EventWrapperProps<T> = ModalBaseProps & {
  event: BCTWEvent<T>;
  eventType: EventType;
  onEventSaved?: () => void; // to notify alert that event was saved
};

/**
 * wraps all of the event pages.
 * handles saving
 */
export default function EventWrapper<E>({
  event,
  eventType,
  onEventSaved,
  open,
  handleClose
}: EventWrapperProps<E>): JSX.Element {
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
  const handleSave = async (event): Promise<void> => {
    if (event) {
      await saveMortality(event);
    }
  };

  // let ChildForm: React.ReactNode;

  return (
    <EditModal<BCTWEvent<E>>
      showInFullScreen={false}
      handleClose={handleClose}
      onSave={handleSave}
      editing={event}
      open={open}
      headerComponent={
        <EditHeader<E>
          title={event.getHeaderTitle()}
          headers={event.getHeaderProps()}
          // fixme:
          obj={event as any}
          format={event.formatPropAsHeader}
        />
      }
      disableTabs={true}
      disableHistory={true}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            // if (v) {
            //   setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            // }
            // // update the disabled status of the retrieved_date field
            // if (Object.keys(v).includes('retrieved')) {
            //   setIsRetrieved(v.retrieved as boolean);
            // }
            handlerFromContext(v, modifyCanSave);
          };
          // const { fields } = mortality;
          // if (!fields) {
          //   return null;
          // }
          switch (eventType) {
            case 'release':
              return <ReleaseEventForm />;
            case 'capture':
              return <CaptureEventForm />;
            case 'mortality':
              return (
                <MortalityEventForm
                  event={event as any}
                  handleSave={handleSave}
                />
              );
            case 'unknown':
            default:
              return <></>;
          }
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
