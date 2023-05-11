import { Critter, AttachedCritter } from 'types/animal';
import { useEffect, useState } from 'react';
import { editObjectToEvent, IBCTWWorkflow, WorkflowType, wfFields } from 'types/events/event';
import WorkflowWrapper from '../events/WorkflowWrapper';
import MortalityEvent from 'types/events/mortality_event';
import CaptureEvent, { CaptureEvent2 } from 'types/events/capture_event';
import ReleaseEvent from 'types/events/release_event';

type CritterWorkflowProps = {
  editing: Critter | AttachedCritter;
  workflow: WorkflowType;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export const CritterWorkflow = ({ editing, workflow, open, setOpen }: CritterWorkflowProps): JSX.Element => {
  /**
   * when a workflow button is clicked, update the event type
   * binding all properties of the @var editing to the event
   */
  const createEvent = (wfType: WorkflowType): CaptureEvent2 | ReleaseEvent | MortalityEvent => {
    switch (wfType) {
      case 'capture':
        return editObjectToEvent(editing, new CaptureEvent2(), []);
      case 'release':
        return editObjectToEvent(editing, new ReleaseEvent(), ['collection_unit']);
      case 'mortality':
        return editObjectToEvent(editing, new MortalityEvent(), ['critter_status']);
    }
  };
  const [event, updateEvent] = useState<CaptureEvent2 | ReleaseEvent | MortalityEvent>();

  useEffect(() => {
    const a = createEvent(workflow);
    // console.log('This is editing obj ' + JSON.stringify(editing, null, 2))
    // console.log('In workflow update effect ' + JSON.stringify(a, null, 2))
    updateEvent(a);
  }, [editing, workflow]);
  /**
   * when a capture workflow is saved, always show the release workflow unless a translocation_ind is underway
   * todo: is this still needed?
   */
  const handleWorkflowSaved = async (e: IBCTWWorkflow): Promise<void> => {
    setOpen(false);
    // if (e.event_type === 'capture' && e instanceof CaptureEvent) {
    //   if (e.translocation_ind && !e.isTranslocationComplete) {
    //     // do nothing
    //   } else {
    //     // show the release form, populating the location and date fields
    //     const rwf = editObjectToEvent(e, new ReleaseEvent(e), ['region', 'collection_unit']);
    //     // set the new event directly, triggering the display of the release form
    //     updateEvent(rwf);
    //     setOpen((o) => !o);
    //   }
    // }
  };

  /**
   * the capture workflow has multiple exit points that chain to other workflows
   * this is a separate handler because we do not want to save the form until the
   * @param nextWorkflow is completed
   */
  const handleWorkflowChain = async (e: CaptureEvent, nextWorkflow: WorkflowType): Promise<void> => {
    if (e.event_type !== 'capture') {
      return;
    }
    let newwf;
    if (nextWorkflow === 'mortality') {
      newwf = new MortalityEvent(undefined, e);
    } else if (nextWorkflow === 'release') {
      newwf = new ReleaseEvent(e);
    }
    if (!newwf) {
      return;
    }
    // there are only animal-related fields in capture workflows
    const next = editObjectToEvent(e.getAnimal(), newwf, []);
    await updateEvent(next);
    await setOpen((o) => !o);
  };

  return (
    <>
      {event?.event_type === workflow ? (
        <WorkflowWrapper
          open={open}
          event={event as any}
          handleClose={(): void => setOpen(false)}
          onEventSaved={handleWorkflowSaved}
          //onEventChain={handleWorkflowChain}
        />
      ) : null}
    </>
  );
};
