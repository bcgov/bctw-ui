import { Box, CircularProgress, Container, Divider, Paper } from '@mui/material';
import { AxiosError } from 'axios';
import { Button, Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useFormHasError from 'hooks/useFormHasError';
import { InboundObj } from 'types/form_types';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ReactNode, useEffect, useState } from 'react';
import { BCTWWorkflow, IBCTWWorkflow, WorkflowType } from 'types/events/event';
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

type WorkflowWrapperProps<T extends IBCTWWorkflow> = ModalBaseProps & {
  event: T;
  onEventSaved?: (e: BCTWWorkflow<T>) => void; // to notify alert that event was saved
  onEventChain?: (e: BCTWWorkflow<T>, wft: WorkflowType) => void;
};

/**
 * wraps all of the workflow components that handles:
    * modal open state
    * saving
 */
export default function WorkflowWrapper<T extends BCTWWorkflow<T>>({
  event,
  onEventChain,
  onEventSaved,
  open,
  handleClose
}: WorkflowWrapperProps<T>): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();

  const [canSave, setCanSave] = useState(false);
  const [hasErr, checkHasErr] = useFormHasError();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<ReactNode>(null);

  useEffect(() => {
    setCanSave(!hasErr);
  }, [hasErr]);

  // save response handler
  const onSuccess = async (e: AxiosError | boolean): Promise<void> => {
    if ((e as AxiosError)?.isAxiosError) {
      showNotif({ severity: 'error', message: formatAxiosError(e as AxiosError) });
    } else {
      showNotif({ severity: 'success', message: `${event.event_type} workflow form saved!` });
      // if the parent implements this, call it on a successful save.
      if (typeof onEventSaved === 'function') {
        onEventSaved(event);
      } else {
        handleClose(false);
      }
    }
  };

  // error response handler
  const onError = (e: AxiosError): void => {
    showNotif({ severity: 'success', message: `error saving ${event.event_type} workflow: ${formatAxiosError(e)}` });
  };

  // setup save mutation
  const { mutateAsync: saveEvent, isLoading } = api.useSaveWorkflowEvent<T>({ onSuccess, onError });

  // performs metadata updates of collar/critter
  const handleSave = async (): Promise<void> => {
    saveEvent(event);
  };

  // update the event when form components change
  const handleChildFormUpdated = (v: InboundObj): void => {
    checkHasErr(v);
    const k = Object.keys(v)[0];
    if (k && k !== 'displayProps') {
      event[k] = Object.values(v)[0];
    }
  };

  /**
   * some forms have actions that when triggered,
   * show a confirmation modal to exit the workflow 'early'.
   */
  const handleShowExitWorkflow = (message: ReactNode): void => {
    setConfirmMessage(message);
    setShowConfirmModal((o) => !o);
  };

  /**
   * if the postpone flag is set, skip the confirmation modal and 
   * close this workflow and immediately call the @param onEventSaved handler
   * which 'continues' to the next workflow
   */
  const handlePostponeSave = (wft: WorkflowType): void => {
    handleClose(false);
    onEventChain(event, wft);
  }

  /**
   * when 'yes' is selected to confirm the workflow early exit,
   * still trigger the save. 
   */
  const handleExitWorkflow = (): void => {
    saveEvent(event);
    setShowConfirmModal(false);
  };

  /**
   * based on the event class, render the workflow form
   */
  const determineWorkflow = (): JSX.Element => {
    const props = { canSave, handleFormChange: handleChildFormUpdated, handleExitEarly: handleShowExitWorkflow, handlePostponeSave };

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
    return <div>error: unable to determine workflow form type</div>;
  };

  return (
    <Modal open={open} handleClose={handleClose}>
      <form className={'event-modal'} autoComplete={'off'}>
        <EditHeader<T>
          title={event?.getWorkflowTitle()}
          headers={event.displayProps}
          obj={event}
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
                    <Button onClick={handleSave} disabled={!canSave}>
                      Save
                    </Button>
                  )}
                  <Button variant='outlined' onClick={(): void => handleClose(false)}>
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
