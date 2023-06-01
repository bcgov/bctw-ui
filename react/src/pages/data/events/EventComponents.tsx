import { BoxProps } from '@mui/material';
import { AttachedCritter, Critter } from 'types/animal';
import { CaptureEvent2 } from 'types/events/capture_event';
import { WorkflowType, editObjectToEvent } from 'types/events/event';
import MortalityEvent from 'types/events/mortality_event';
// import ReleaseEvent from 'types/events/release_event';

const boxSpreadRowProps: Pick<BoxProps, 'display' | 'justifyContent' | 'alignItems' | 'columnGap'> = {
  columnGap: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

// export type CastEvent<Wf extends WorkflowType> = Wf extends 'capture' ? CaptureEvent2 : MortalityEvent;

const createEvent = (critter: Critter | AttachedCritter, wfType: WorkflowType) => {
  if (wfType === 'capture') {
    return editObjectToEvent(critter, new CaptureEvent2(), []);
  }
  if (wfType === 'mortality') {
    return editObjectToEvent(critter, new MortalityEvent(), []);
  }
};

export { createEvent, boxSpreadRowProps };
