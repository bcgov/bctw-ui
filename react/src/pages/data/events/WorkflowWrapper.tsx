import { Box, CircularProgress, Container, Divider, Paper } from '@material-ui/core';
import { AxiosError } from 'axios';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useFormHasError from 'hooks/useFormHasError';
import { InboundObj } from 'types/form_types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { BCTWEvent, EventType } from 'types/events/event';
import { formatAxiosError } from 'utils/errors';
import { EditHeader } from '../common/EditModalComponents';
import CaptureEventForm from './CaptureEventForm';
import MortalityEventForm from './MortalityEventForm';
import ReleaseEventForm from './ReleaseEventForm';
import MortalityEvent from 'types/events/mortality_event';
import RetrievalEventForm from './RetrievalEventForm';
import RetrievalEvent from 'types/events/retrieval_event';

type WorkflowWrapperProps<T> = ModalBaseProps & {
  event: BCTWEvent<T>;
  eventType: EventType;
  onEventSaved?: () => void; // to notify alert that event was saved
};

/**
 * wraps all of the event pages.
 * handles saving
 */
export default function WorkflowWrapper<E>({
  event,
  eventType,
  onEventSaved,
  open,
  handleClose
}: WorkflowWrapperProps<E>): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const [canSave, setCanSave] = useState(false);
  const [hasErr, checkHasErr] = useFormHasError();

  useEffect(() => {
    // console.log('event wrapper error status', hasErr);
    setCanSave(!hasErr);
  }, [hasErr]);

  const onSuccess = async (e: AxiosError | boolean): Promise<void> => {
    if ((e as AxiosError)?.isAxiosError) {
      responseDispatch({ severity: 'error', message: formatAxiosError(e as AxiosError) });
    } else {
      // console.log('sucess!!', e);
      responseDispatch({ severity: 'success', message: 'mortality event saved!' });
      // expire the telemetry alert
      if (typeof onEventSaved === 'function') {
        onEventSaved();
      }
    }
  };

  const onError = (e: AxiosError): void => {
    console.log('error saving event', formatAxiosError(e));
    responseDispatch({ severity: 'success', message: 'mortality event saved!' });
  };

  // setup save mutation
  const { mutateAsync: saveEvent, isLoading } = bctwApi.useMutateMortalityEvent({ onSuccess, onError });

  // performs metadata updates of collar/critter
  const handleSave = async (): Promise<void> => {
    // fixme: typing event to specific
    saveEvent(event as BCTWEvent<unknown>);
  };

  const handleChildFormUpdated = (v: InboundObj): void => {
    checkHasErr(v);
    const k = Object.keys(v)[0];
    // console.log(event[k])
    if (k && k !== 'displayProps') {
      event[k] = Object.values(v)[0];
    }
    // console.log(event[k])
  };

  let Comp: React.ReactNode;
  switch (eventType) {
    case 'release':
      Comp = <ReleaseEventForm />;
      break;
    case 'capture':
      Comp = <CaptureEventForm />;
      break;
    case 'mortality':
      Comp = <MortalityEventForm handleFormChange={handleChildFormUpdated} event={event as unknown as MortalityEvent} />;
      break;
    case 'retrieval': 
      Comp = <RetrievalEventForm handleFormChange={handleChildFormUpdated} event={event as unknown as RetrievalEvent} />;
      break;
    case 'unknown':
    default:
      Comp = <></>;
  }

  return (
    <Modal open={open} handleClose={handleClose}>
      <form className={'event-modal'} autoComplete={'off'}>
        <EditHeader<E>
          title={event?.getHeaderTitle()}
          headers={event.displayProps}
          obj={event as any}
          format={event.formatPropAsHeader}
        />

        <Container maxWidth='xl'>
          <Box py={3}>
            <Paper>
              {Comp}

              <Box my={1} mx={3}>
                <Divider></Divider>
              </Box>

              <Box p={3}>
                <Box display='flex' justifyContent='flex-end' className='form-buttons'>
                  {isLoading ? <CircularProgress /> : <Button size='large' color='primary' onClick={handleSave} disabled={!canSave}>Save</Button>}
                  <Button size='large' variant='outlined' color='primary' onClick={(): void => handleClose(false)}>
                    Cancel and Exit
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </form>
    </Modal>
  );
}
