import { Box, CircularProgress, Divider, Paper, capitalize } from '@mui/material';
import { AxiosError } from 'axios';
import { Button, Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useFormHasError from 'hooks/useFormHasError';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ReactNode, useEffect, useState } from 'react';
import { CaptureEvent2 } from 'types/events/capture_event';
import { SuperWorkflow, WorkflowType } from 'types/events/event';
import MalfunctionEvent from 'types/events/malfunction_event';
import MortalityEvent from 'types/events/mortality_event';
import RetrievalEvent from 'types/events/retrieval_event';
import { InboundObj } from 'types/form_types';
import { formatAxiosError } from 'utils/errors';
import { EditHeader } from '../common/EditModalComponents';
import CaptureEventForm from './CaptureEventForm';
import MalfunctionEventForm from './MalfunctionEventForm';
import MortalityEventForm from './MortalityEventForm';
import RetrievalEventForm from './RetrievalEventForm';

type WorkflowWrapperProps<T extends SuperWorkflow> = ModalBaseProps & {
  event: T;
  onEventSaved?: (e: T) => void; // to notify alert that event was saved
  onEventChain?: (e: T, wft: WorkflowType) => void;
};

/**
 * wraps all of the workflow components that handles:
 * modal open state
 * saving
 */
export default function WorkflowWrapper<T extends SuperWorkflow>({
  event,
  onEventChain,
  onEventSaved,
  open,
  handleClose
}: WorkflowWrapperProps<T>): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();

  // const [event, setevent] = useState(event);
  //console.log({ event }, { event });
  const [canSave, setCanSave] = useState(false);
  const [hasErr, checkHasErr] = useFormHasError();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<ReactNode>(null);

  useEffect(() => {
    setCanSave(!hasErr /*&& eventHasAllRequiredProperties()*/);
  }, [hasErr]);

  /*const eventHasAllRequiredProperties = (): boolean => {
    if (event.fields) {
      for (const [k, v] of Object.entries(event.fields)) {
        if (v.required && !event[k]) {
          // console.log(`Missing required property ${k} -> ${event[k]}`);
          return false;
        }
      }
      //console.log('No missing properties detected.');
      return true;
    }
  };*/

  // save response handler
  const onSuccess = async (e: AxiosError | boolean): Promise<void> => {
    if ((e as AxiosError)?.isAxiosError) {
      showNotif({ severity: 'error', message: formatAxiosError(e as AxiosError) });
    } else {
      // console.log('sucess!!', e);
      showNotif({ severity: 'success', message: `${capitalize(event.event_type)} event saved!` });
      // if the parent implements this, call it on a successful save.
      if (typeof onEventSaved === 'function') {
        onEventSaved(event);
      }
      handleClose(false);
    }
  };

  // error response handler
  const onError = (e: AxiosError): void => {
    showNotif({
      severity: 'success',
      message: `error saving ${event.event_type} workflow: ${formatAxiosError(e)}`
    });
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

    // const tmp = event;
    const k = Object.keys(v)[0];
    const tempval = Object.values(v)[0];
    const val = tempval === undefined || tempval === null ? null : tempval['id'] ?? tempval;
    //If tempval is undefined or null, just leave it as null. Otherwise, try to access the id property from it, but if that fails just use the non-null tempval as is.
    const { nestedEventKey } = v;

    if (nestedEventKey) {
      event[nestedEventKey][k] = val;
    } else if (k && k !== 'displayProps') {
      event[k] = val;
    }
    setCanSave(!hasErr /*&& eventHasAllRequiredProperties()*/);
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
  };

  /**
   * when 'yes' is selected to confirm the workflow early exit,
   * still trigger the save.
   */
  const handleExitWorkflow = (): void => {
    // console.log('exiting workflow early!');
    saveEvent(event);
    setShowConfirmModal(false);
  };

  /**
   * based on the event class, render the workflow form
   */
  const props = {
    canSave,
    handleFormChange: handleChildFormUpdated,
    handleExitEarly: handleShowExitWorkflow,
    handlePostponeSave
  };
  const determineWorkflow = (): JSX.Element => {
    if (event instanceof CaptureEvent2) {
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
    <Modal
      open={open}
      handleClose={handleClose}
      useButton
      headercomp={
        <EditHeader<T>
          title={event?.getWorkflowTitle()}
          headers={event.displayProps()}
          obj={event}
          format={event.formatPropAsHeader}
        />
      }>
      <form className={'event-modal'} autoComplete={'off'}>
        <Box>
          <Paper sx={{ padding: 3 }}>
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
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
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
