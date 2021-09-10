import { Box, Container, Divider, Paper } from '@material-ui/core';
import { IBulkUploadResults } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import React from 'react';
import { BCTWEvent, EventType } from 'types/events/event';
import { formatAxiosError } from 'utils/errors';
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

  let Comp: React.ReactNode;
  switch (eventType) {
    case 'release':
      // return <ReleaseEventForm />;
      Comp = <ReleaseEventForm />;
      break;
    case 'capture':
      // return <CaptureEventForm />;
      Comp = <CaptureEventForm />;
      break;
    case 'mortality':
      Comp = <MortalityEventForm event={event as any} handleSave={handleSave} />;
      break;
    case 'unknown':
    default:
      Comp = <></>;
  }

  return (
    <Modal open={open} handleClose={handleClose}>
      <form className={'rootEditInput'} autoComplete={'off'}>
        <EditHeader<E>
          title={event.getHeaderTitle()}
          headers={event.displayProps}
          obj={event as any}
          format={event.formatPropAsHeader}
        />

        <Container maxWidth='xl'>
          <Box py={3}>
            {/* <EditTabPanel value={value} index={0}> */}
            <Paper>
              {Comp}

              <Box my={1} mx={3}>
                <Divider></Divider>
              </Box>

              <Box p={3}>
                <Box display='flex' justifyContent='flex-end' className='form-buttons'>
                  <Button size='large' color='primary' onClick={handleSave} /*disabled={!canSave}*/>
                    Save
                  </Button>
                  <Button size='large' variant='outlined' color='primary' onClick={(): void => handleClose(false)}>
                    Cancel and Exit
                  </Button>
                </Box>
              </Box>
            </Paper>
            {/* </EditTabPanel> */}
          </Box>
        </Container>
      </form>
    </Modal>
  );

  //   <EditModal<R>
  //     showInFullScreen={false}
  //     handleClose={handleClose}
  //     onSave={handleSave}
  //     editing={event}
  //     open={open}
  //     headerComponent={
  //       <EditHeader<E>
  //         title={event.getHeaderTitle()}
  //         headers={event.displayProps}
  //         // fixme:
  //         obj={event as any}
  //         format={event.formatPropAsHeader}
  //       />
  //     }
  //     disableTabs={true}
  //     disableHistory={true}>

  //     <ChangeContext.Consumer>
  //       {(handlerFromContext): JSX.Element => {
  //         // override the modal's onChange function
  //         const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
  //           handlerFromContext(v, modifyCanSave);
  //         };
  //         switch (eventType) {
  //           case 'release':
  //             return <ReleaseEventForm />;
  //           case 'capture':
  //             return <CaptureEventForm />;
  //           case 'mortality':
  //             return (
  //               <MortalityEventForm
  //                 event={event as any}
  //                 handleSave={handleSave}
  //               />
  //             );
  //           case 'unknown':
  //           default:
  //             return <></>;
  //         }
  //       }}
  //     </ChangeContext.Consumer>
  //   </EditModal>
  // );
}
