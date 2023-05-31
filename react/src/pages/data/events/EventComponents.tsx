import { BoxProps } from '@mui/material';
import { AttachedCritter, Critter } from 'types/animal';
import { CaptureEvent2 } from 'types/events/capture_event';
import { WorkflowType, editObjectToEvent } from 'types/events/event';
import MortalityEvent from 'types/events/mortality_event';
import ReleaseEvent from 'types/events/release_event';

const boxSpreadRowProps: Pick<BoxProps, 'display' | 'justifyContent' | 'alignItems' | 'columnGap'> = {
  columnGap: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const createEvent = (
  critter: Critter | AttachedCritter,
  wfType: WorkflowType
): CaptureEvent2 | ReleaseEvent | MortalityEvent => {
  switch (wfType) {
    case 'capture':
      return editObjectToEvent(critter, new CaptureEvent2(), []);
    case 'release':
      return editObjectToEvent(critter, new ReleaseEvent(), ['collection_unit']);
    case 'mortality':
      return editObjectToEvent(critter, new MortalityEvent(), ['critter_status']);
  }
};

export { createEvent, boxSpreadRowProps };
