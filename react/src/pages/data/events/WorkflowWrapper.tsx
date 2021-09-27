import { Box, CircularProgress, Container, Divider, Paper } from '@material-ui/core';
import { AxiosError } from 'axios';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useFormHasError from 'hooks/useFormHasError';
import { InboundObj } from 'types/form_types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ReactNode, useEffect, useState } from 'react';
import { BCTWWorkflow } from 'types/events/event';
import { formatAxiosError } from 'utils/errors';
import { EditHeader } from '../common/EditModalComponents';
import CaptureEventForm from './CaptureEventForm';
import MortalityEventForm from './MortalityEventForm';
import ReleaseEventForm from './ReleaseEventForm';
import MortalityEvent from 'types/events/mortality_event';
import RetrievalEventForm from './RetrievalEventForm';
import RetrievalEvent from 'types/events/retrieval_event';
import ConfirmModal from 'components/modal/ConfirmModal';
import CaptureEvent from 'types/events/capture_event';
import ReleaseEvent from 'types/events/release_event';
import MalfunctionEvent from 'types/events/malfunction_event';
import MalfunctionEventForm from './MalfunctionEventForm';

type WorkflowWrapperProps<T extends BCTWWorkflow<T>> = ModalBaseProps & {
  event: T;
  onEventSaved?: (e: BCTWWorkflow<T>) => void; // to notify alert that event was saved
};

/**
 * wraps all of the workflow components.
 * handles:
    * modal state
    * saving
 * todo: Reset event on closing/saving modal
 */
export default function WorkflowWrapper<T extends BCTWWorkflow<T>>({
  event,
  onEventSaved,
  open,
  handleClose
}: WorkflowWrapperProps<T>): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const [canSave, setCanSave] = useState(false);
  const [hasErr, checkHasErr] = useFormHasError();
  //
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<ReactNode>(null);

  useEffect(() => {
    setCanSave(!hasErr);
  }, [hasErr]);

  const onSuccess = async (e: AxiosError | boolean): Promise<void> => {
    if ((e as AxiosError)?.isAxiosError) {
      responseDispatch({ severity: 'error', message: formatAxiosError(e as AxiosError) });
    } else {
      // console.log('sucess!!', e);
      responseDispatch({ severity: 'success', message: `${event.event_type} workflow form saved!` });
      // if the parent implements this, call it on successful save.
      // Ex. UserAlertPage component will expire the telemetry alert
      if (typeof onEventSaved === 'function') {
        onEventSaved(event);
      } else {
        handleClose(false)
      }
    }
  };

  const onError = (e: AxiosError): void => {
    console.log('error saving event', formatAxiosError(e));
    responseDispatch({ severity: 'success', message: `error saving ${event.event_type} workflow: ${formatAxiosError(e)}` });
  };

  // setup save mutation
  const { mutateAsync: saveEvent, isLoading } = bctwApi.useMutateWorkflowEvent<T>({ onSuccess, onError });

  // performs metadata updates of collar/critter
  const handleSave = async (): Promise<void> => {
    saveEvent(event);
  };

  // update the event when form components change
  const handleChildFormUpdated = (v: InboundObj): void => {
    checkHasErr(v);
    const k = Object.keys(v)[0];
    // console.log(event[k])
    if (k && k !== 'displayProps') {
      event[k] = Object.values(v)[0];
    }
    // console.log(event[k])
  };

  /**
   * some forms have actions that when triggered, should show a confirmation modal to
   * exist the workflow 'early'. this modal exists here
   */
  const handleShowExitWorkflow = (message: ReactNode): void => {
    setConfirmMessage(message);
    setShowConfirmModal((o) => !o);
  };

  /**
   * when 'yes' is selected to confirm the early exit of the workflow, perform the save
   * workflows that use this behavior 
   */
  const handleExitWorkflow = (): void => {
    console.log('exiting workflow early!');
    saveEvent(event);
    setShowConfirmModal(false);
  };

  /** 
   * based on the event class, render the workflow form
   * fixme: not very typescripty
   */
  const determineWorkflow = (): JSX.Element => {
    const props = { handleFormChange: handleChildFormUpdated, handleExitEarly: handleShowExitWorkflow};

    if (event instanceof ReleaseEvent) {
      return <ReleaseEventForm {...props} event={event} />;
    } else if (event instanceof CaptureEvent) {
      return <CaptureEventForm {...props} event={event} />;
    } else if (event instanceof MortalityEvent) {
      return <MortalityEventForm {...props} event={event} />;
    } else if (event instanceof RetrievalEvent) {
      return <RetrievalEventForm {...props} event={event} />;
    } else if (event instanceof MalfunctionEvent) {
      return <MalfunctionEventForm {...props} event={event} />;
    }
    return <div>error: unable to determine workflow form type</div>
  }

  return (
    <Modal open={open} handleClose={handleClose}>
      <form className={'event-modal'} autoComplete={'off'}>
        <EditHeader<T>
          title={event?.getWorkflowTitle()}
          headers={event.displayProps}
          obj={event as any}
          format={event.formatPropAsHeader}
        />

        <Container maxWidth='xl'>
          <Box py={3}>
            <Paper>
              {determineWorkflow()}
              <Box my={1} mx={3}>
                <Divider></Divider>
              </Box>

              <Box p={3}>
                <Box display='flex' justifyContent='flex-end' className='form-buttons'>
                  {isLoading ? (
                    <CircularProgress />
                  ) : (
                    <Button size='large' color='primary' onClick={handleSave} disabled={!canSave}>
                      Save
                    </Button>
                  )}
                  <Button size='large' variant='outlined' color='primary' onClick={(): void => handleClose(false)}>
                    Cancel and Exit
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </form>
      <ConfirmModal
        message={confirmMessage}
        handleClickYes={handleExitWorkflow}
        open={showConfirmModal}
        handleClose={(): void => setShowConfirmModal(false)}
      />
    </Modal>
  );
}
