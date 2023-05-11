import { Box, CircularProgress, Divider, Paper, capitalize } from '@mui/material';
import { AxiosError } from 'axios';
import { Button, Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import ConfirmModal from 'components/modal/ConfirmModal';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useFormHasError from 'hooks/useFormHasError';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { CaptureEvent2 } from 'types/events/capture_event';
import { BCTWWorkflow, IBCTWWorkflow, WorkflowType } from 'types/events/event';
import MalfunctionEvent from 'types/events/malfunction_event';
import MortalityEvent from 'types/events/mortality_event';
import ReleaseEvent from 'types/events/release_event';
import RetrievalEvent from 'types/events/retrieval_event';
import { InboundObj } from 'types/form_types';
import { formatAxiosError } from 'utils/errors';
import { EditHeader } from '../common/EditModalComponents';
import CaptureEventForm from './CaptureEventForm';
import MalfunctionEventForm from './MalfunctionEventForm';
import MortalityEventForm from './MortalityEventForm';
import ReleaseEventForm from './ReleaseEventForm';
import RetrievalEventForm from './RetrievalEventForm';
import { classToPlain } from 'class-transformer';

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

  const [statefulEvent, setStatefulEvent] = useState(event);
  //console.log({ event }, { statefulEvent });
  const [canSave, setCanSave] = useState(false);
  const [hasErr, checkHasErr] = useFormHasError();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<ReactNode>(null);

  useEffect(() => {
    setCanSave(!hasErr && eventHasAllRequiredProperties());
  }, [hasErr]);

  const eventHasAllRequiredProperties = (): boolean => {
    if(statefulEvent.fields) {
      for(const [k, v] of Object.entries(statefulEvent.fields)) {
        if(v.required && !statefulEvent[k]) {
          console.log(`Missing required property ${k} -> ${statefulEvent[k]}`)
          return false;
        }
      }
      console.log('No missing properties detected.');
      return true;
    }
  }

  useEffect(() => {
    setStatefulEvent(event);
  }, [event])

  // save response handler
  const onSuccess = async (e: AxiosError | boolean): Promise<void> => {
    if ((e as AxiosError)?.isAxiosError) {
      showNotif({ severity: 'error', message: formatAxiosError(e as AxiosError) });
    } else {
      // console.log('sucess!!', e);
      showNotif({ severity: 'success', message: `${capitalize(statefulEvent.event_type)} event saved!` });
      // if the parent implements this, call it on a successful save.
      if (typeof onEventSaved === 'function') {
        onEventSaved(statefulEvent);
      }
      handleClose(false);
    }
  };

  // error response handler
  const onError = (e: AxiosError): void => {
    showNotif({
      severity: 'success',
      message: `error saving ${statefulEvent.event_type} workflow: ${formatAxiosError(e)}`
    });
  };

  // setup save mutation
  const { mutateAsync: saveEvent, isLoading } = api.useSaveWorkflowEvent<T>({ onSuccess, onError });

  // performs metadata updates of collar/critter
  const handleSave = async (): Promise<void> => {
    saveEvent(statefulEvent);
  };

  // update the event when form components change
  const handleChildFormUpdated = (v: InboundObj): void => {
    checkHasErr(v);
    
    const tmp = statefulEvent;
    const k = Object.keys(v)[0];
    const tempval = Object.values(v)[0] ;
    const val = tempval === undefined || tempval === null ? null : (tempval['id'] ?? tempval);
    //If tempval is undefined or null, just leave it as null. Otherwise, try to access the id property from it, but if that fails just use the non-null tempval as is.
    const { nestedEventKey } = v;
    
    if (nestedEventKey) {
      Object.assign(tmp[nestedEventKey], { [k]: val });
      setStatefulEvent(tmp);
    }
    else if (k && k !== 'displayProps') {
      tmp[k] = val;
      setStatefulEvent(tmp);
    }
    setCanSave(!hasErr && eventHasAllRequiredProperties());
    //const a = eventHasAllRequiredProperties();
    //console.log(`${JSON.stringify(v)} -- Set canSave with ${!hasErr} and ${a}`)
    //setCanSave(!hasErr && a);
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
    onEventChain(statefulEvent, wft);
  };

  /**
   * when 'yes' is selected to confirm the workflow early exit,
   * still trigger the save.
   */
  const handleExitWorkflow = (): void => {
    // console.log('exiting workflow early!');
    saveEvent(statefulEvent);
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
    if (statefulEvent instanceof ReleaseEvent) {
      return <ReleaseEventForm {...props} event={statefulEvent} />;
    } else if (statefulEvent instanceof CaptureEvent2) {
      return <CaptureEventForm {...props} event={statefulEvent} />;
    } else if (statefulEvent instanceof MortalityEvent) {
      return <MortalityEventForm {...props} event={statefulEvent} />;
    } else if (statefulEvent instanceof RetrievalEvent) {
      return <RetrievalEventForm {...props} event={statefulEvent} />;
    } else if (statefulEvent instanceof MalfunctionEvent) {
      return <MalfunctionEventForm {...props} event={statefulEvent} />;
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
          title={statefulEvent?.getWorkflowTitle()}
          headers={statefulEvent.displayProps}
          obj={statefulEvent}
          format={statefulEvent.formatPropAsHeader}
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
